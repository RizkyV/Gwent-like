import { flipCoin, getPlayerHandSize } from './helpers/utils.js';
import { ALWAYS_ENEMY_START_PLAYER, ALWAYS_FRIENDLY_START_PLAYER, CARDS_DRAWN_ROUND_1, CARDS_DRAWN_ROUND_2, CARDS_DRAWN_ROUND_3 } from './constants.js';
import { GameState, CardInstance, PlayerRole, EffectContext, GamePhase, Zone, HookType, GameConfig, CardDefinition } from './types.js';
import { getOtherPlayer } from './helpers/player.js';
import { buildDeck } from './helpers/deck.js';

let gameState: GameState | null = null;
const listeners: Array<(state: GameState | null) => void> = [];

export function subscribe(listener: (state: GameState | null) => void) {
  listeners.push(listener);
  // Optionally, call immediately with current state:
  listener(gameState);
  return () => {
    // Unsubscribe
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getGameState(): GameState | null {
  return gameState;
}

export function setGameState(newState: GameState) {
  console.info('Setting new game state:', newState);
  gameState = checkState(newState);
  listeners.forEach(listener => listener(gameState));
}

export function resetGameState(friendlyDeck: CardDefinition[], enemyDeck: CardDefinition[], config: GameConfig) {
  setGameState({
    players: {
      friendly: {
        hand: [],
        deck: buildDeck(friendlyDeck, 'friendly'),
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      },
      enemy: {
        hand: [],
        deck: buildDeck(enemyDeck, 'enemy'),
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      }
    },
    currentPlayer: ALWAYS_FRIENDLY_START_PLAYER ? 'friendly' : ALWAYS_ENEMY_START_PLAYER ? 'enemy' : (flipCoin() ? 'friendly' : 'enemy'),
    currentRound: 0,
    phase: GamePhase.Draw,
    turn: {
      hasActivatedAbility: false,
      hasPlayedCard: false
    },
    GameConfig: config
  });
}

/**
 * Checks for dead cards, triggers onDeath hooks, and moves them to graveyard.
 * Returns the updated state.
 */
export function checkState(state: GameState): GameState {
  let newState = state;

  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    for (let rowIdx = 0; rowIdx < newState.players[role].rows.length; rowIdx++) {
      const row = newState.players[role].rows[rowIdx];
      // Find dead cards (power <= 0)
      const deadCards = row.cards.filter(card => card.currentPower <= 0);
      if (deadCards.length > 0) {
        // Remove dead cards from the row
        const survivingCards = row.cards.filter(card => card.currentPower > 0);
        newState = {
          ...newState,
          players: {
            ...newState.players,
            [role]: {
              ...newState.players[role],
              rows: newState.players[role].rows.map((r, i) =>
                i === rowIdx ? { ...r, cards: survivingCards } : r
              ),
              graveyard: [
                ...newState.players[role].graveyard,
                ...deadCards
              ]
            }
          }
        };
        // Trigger onDeath hooks for each dead card - TODO: This has timing issues, and should be done after the card has been removed and the state set.
        for (const deadCard of deadCards) {
          triggerHook(HookType.OnDeath, { source: deadCard });
        }
      }
    }
  }

  return newState;
}

/* 
 * Helper functions
*/
export function startRound() {
  const newState = { ...gameState };
  newState.currentRound += 1;
  newState.players.friendly.passed = false;
  newState.players.enemy.passed = false;
  newState.turn = {
    hasActivatedAbility: false,
    hasPlayedCard: false
  };
  newState.phase = GamePhase.Mulligan;
  setGameState(newState);
  console.log(`Starting round ${newState.currentRound}`);

  //Draw the appropriate number of cards for each player
  (['friendly', 'enemy'] as PlayerRole[]).forEach(role => {
    const cardsToDraw =
      gameState.currentRound === 1
        ? CARDS_DRAWN_ROUND_1
        : gameState.currentRound === 2
          ? CARDS_DRAWN_ROUND_2
          : CARDS_DRAWN_ROUND_3;
    drawCards(cardsToDraw, role);
  });
  //TODO: Trigger onRoundStart hooks for each player
}

export function drawCards(count: number, player: PlayerRole) {
  const newState = { ...gameState };
  const playerState = gameState.players[player];
  const drawn = playerState.deck.slice(0, count);
  const newDeck = playerState.deck.slice(count);
  newState.players[player].deck = newDeck;
  newState.players[player].hand = [...playerState.hand, ...drawn];
  console.log(`${player} drew ${drawn.length} cards.`);
  //TODO: Trigger onDraw hooks for each drawn card
  setGameState(newState);

}

export function mulliganCards() {
  //TODO: Implement mulligan logic
  console.log('Mulligan phase not implemented yet - Skipping to play phase.');
  const newState = { ...gameState };
  newState.phase = GamePhase.Play;
  setGameState(newState);
}

export function passTurn(player: PlayerRole) {
  const newState = { ...gameState };
  newState.players[player].passed = true;
  console.log(`${player} passed their turn.`);
  setGameState(newState);
}

export function startTurn() {
  triggerHook(HookType.OnTurnStart, { player: gameState.currentPlayer });
}
export function endTurn() {
  const newState = { ...gameState };

  const oldPlayer = newState.currentPlayer;
  //If active player has no cards in hand, pass their turn instead
  if(getPlayerHandSize(oldPlayer) === 0) {
    console.log(`${oldPlayer} has no cards in hand, passing turn.`);
    newState.players[oldPlayer].passed = true;
  }

  const newPlayer = getOtherPlayer(newState.currentPlayer);
  //If the non-active player has passed, do not flip to them
  if (!newState.players[newPlayer].passed) {
    newState.currentPlayer = newPlayer;
  } else {
    console.log(`${newPlayer} has passed, turn will not flip to them.`);
  }

  newState.turn = { hasActivatedAbility: false, hasPlayedCard: false };
  setGameState(newState);
  triggerHook(HookType.OnTurnEnd, { player: oldPlayer });

  //Trigger the Turn hooks for players who have passed and therefore do not get a real turn
  if (newState.currentPlayer === oldPlayer) { 
    triggerHook(HookType.OnTurnStart, { player: newPlayer });
    triggerHook(HookType.OnTurnEnd, { player: newPlayer });
  }
}

export function checkEndOfRound(): boolean {
  const bothPassed = gameState.players.friendly.passed && gameState.players.enemy.passed;
  const bothHandsEmpty = gameState.players.friendly.hand.length === 0 && gameState.players.enemy.hand.length === 0;
  if (bothPassed || bothHandsEmpty) {
    return true;
  }
  return false;
}

export function endRound() {
  const newState = { ...gameState };
  //TODO: Trigger onRoundEnd hooks for each player
  const friendlyPoints = gameState.players.friendly.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);
  const enemyPoints = gameState.players.enemy.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);

  if (friendlyPoints > enemyPoints) {
    newState.players.friendly.roundWins += 1;
    console.log(`Round ${gameState.currentRound} goes to Friendly (${friendlyPoints} vs ${enemyPoints})`);
  } else if (enemyPoints > friendlyPoints) {
    newState.players.enemy.roundWins += 1;
    console.log(`Round ${gameState.currentRound} goes to Enemy (${enemyPoints} vs ${friendlyPoints})`);
  } else {
    //Both players get a point in case of a tie
    newState.players.friendly.roundWins += 1;
    newState.players.enemy.roundWins += 1;
    console.log(`Round ${gameState.currentRound} is a tie! (${friendlyPoints} vs ${enemyPoints})`);
  }
  setGameState(newState);

  //Reset rows for the next round
  //TODO: Check resilience
  (['friendly', 'enemy'] as PlayerRole[]).forEach(role => {
    newState.players[role].rows.forEach(row => {
      row.cards.forEach(card => {
        moveToZone(card, role, Zone.Graveyard);
      });
      row.cards = [];
    });
  });
}

// Moves a card to a specified zone for its owner
//TODO: parameter for triggerHook
export function moveToZone(card: CardInstance, player: PlayerRole, zone: Zone) {
  let owner: PlayerRole | null = null;
  let rowIdx = -1;
  let cardIdx = -1;

  // Find the card in rows, hand, or deck
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    // Rows
    for (let r = 0; r < gameState.players[role].rows.length; r++) {
      const row = gameState.players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === card.instanceId) {
          owner = role;
          rowIdx = r;
          cardIdx = c;
          break;
        }
      }
      if (owner) break;
    }
    // Hand
    if (!owner) {
      const handIdx = gameState.players[role].hand.findIndex(c => c.instanceId === card.instanceId);
      if (handIdx !== -1) {
        owner = role;
        rowIdx = -1;
        cardIdx = handIdx;
        break;
      }
    }
    // Deck
    if (!owner) {
      const deckIdx = gameState.players[role].deck.findIndex(c => c.instanceId === card.instanceId);
      if (deckIdx !== -1) {
        owner = role;
        rowIdx = -2;
        cardIdx = deckIdx;
        break;
      }
    }
  }
  if (!owner) return; // Card not found

  // Remove card from its current zone
  const newState = { ...gameState };
  if (rowIdx >= 0) {
    // Remove from row
    newState.players[owner].rows = newState.players[owner].rows.map((row, rIdx) =>
      rIdx === rowIdx
        ? { ...row, cards: row.cards.filter(c => c.instanceId !== card.instanceId) }
        : row
    );
  } else if (rowIdx === -1) {
    // Remove from hand
    newState.players[owner].hand = newState.players[owner].hand.filter(c => c.instanceId !== card.instanceId);
  } else if (rowIdx === -2) {
    // Remove from deck
    newState.players[owner].deck = newState.players[owner].deck.filter(c => c.instanceId !== card.instanceId);
  }

  // Add card to the specified zone
  switch (zone) {
    case Zone.Graveyard:
      newState.players[owner].graveyard = [...newState.players[owner].graveyard, card];
      break;
    case Zone.Hand:
      newState.players[owner].hand = [...newState.players[owner].hand, card];
      break;
    case Zone.Deck:
      newState.players[owner].deck = [...newState.players[owner].deck, card];
      break;
    case Zone.RowMelee:
    case Zone.RowRanged:
      newState.players[owner].rows = newState.players[owner].rows.map(row =>
        row.id === zone ? { ...row, cards: [...row.cards, card] } : row
      );
      break;
  }
  setGameState(newState);
}

export function setToPhase(phase: GamePhase) {
  const newState = { ...gameState };
  newState.phase = phase;
  setGameState(newState);
}

export function playCard(card: CardInstance, player: PlayerRole, target?: CardInstance): void {
  moveToZone(card, player, Zone.RowMelee); // Default to melee row for simplicity
  const newState = { ...gameState };
  newState.turn.hasPlayedCard = true;
  setGameState(newState);
  triggerHook(HookType.OnPlay, { source: card, target: target });
}


// Calculate the total points for a row
export function getRowPoints(row): number {
  return row.cards.reduce((sum, card) => sum + (card.currentPower ?? card.baseCard.basePower ?? 0), 0);
}

// Calculate the total points for a player (sum of all rows)
export function getPlayerPoints(playerState): number {
  return playerState.rows.reduce((sum, row) => sum + getRowPoints(row), 0);
}

export function triggerHook(
  hook: HookType,
  context: EffectContext,
): void {
  console.info(`Triggering hook: ${hook}`, context);
  const allCards = [...gameState.players.friendly.rows, ...gameState.players.enemy.rows].flatMap(row => row.cards);

  for (const card of allCards) {
    const hookedEffects = card.baseCard.effects?.filter(e => e.hook === hook) || [];
    for (const { effect } of hookedEffects) {
      const scopedContext: EffectContext = {
        ...context,
        self: card,
      };
      effect(scopedContext);
    }
  }
}

export function getCardController(card: CardInstance): PlayerRole {
  const cardId = card.instanceId;
  const friendlyHasCard = gameState.players.friendly.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );
  const friendlyInHand = gameState.players.friendly.hand.some(c => c.instanceId === cardId);
  if (friendlyHasCard || friendlyInHand) return 'friendly';
  const enemyHasCard = gameState.players.enemy.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );
  const enemyInHand = gameState.players.friendly.hand.some(c => c.instanceId === cardId);
  if (enemyHasCard || enemyInHand) return 'enemy';
  throw new Error(`Could not determine controller of card with instanceId: ${cardId}`);
}

/**
 * Deals damage to a card and triggers hooks
 * @param targetId The instanceId of the card to damage
 * @param amount The amount of damage to deal
 * @param context The effect context (source, player, etc.)
 */
export function dealDamage(target: CardInstance, amount: number, context: EffectContext): void {
  const newState = { ...gameState };
  //Find the target card in the game state
  const targetCard = findCardOnBoard(newState, target.instanceId);

  // Check for immunities, shields, etc. (expand as needed)
  // Example: if (targetCard.statuses.has('immune')) return state;

  // Apply damage
  const newPower = Math.max(0, targetCard.currentPower - amount);
  targetCard.currentPower = newPower;
  const damagedAmount = targetCard.currentPower - newPower;
  setGameState(newState);
  //TODO: send along the source
  triggerHook(HookType.OnDamaged, {
    ...context,
    metadata: {
      damagedCard: targetCard,
      damageAmount: damagedAmount,
    }
  });
}

export function boostCard(target: CardInstance, amount: number, context: EffectContext): void {
  const newState = { ...gameState };
  //Find the target card in the game state
  const targetCard = findCardOnBoard(newState, target.instanceId);

  //TODO: check for all sort of stuff

  // Apply boost
  const newPower = targetCard.currentPower + amount;
  targetCard.currentPower = newPower;
  const boostedAmount = newPower - targetCard.currentPower;
  setGameState(newState);
  //TODO: send along the source
  triggerHook(HookType.OnBoosted, {
    ...context,
    target: targetCard,
    metadata: {
      boostedCard: targetCard,
      boostAmount: boostedAmount,
    }
  });
}
/**
 * State builder helpers
 */

export function findCardOnBoard(state: GameState, targetId: string): CardInstance | null {
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    for (let r = 0; r < state.players[role].rows.length; r++) {
      const row = state.players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === targetId) {
          return row.cards[c];
        }
      }
    }
  }
  return null; // Card not found
}