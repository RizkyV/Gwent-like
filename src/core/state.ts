import { CARDS_DRAWN_ROUND_1, CARDS_DRAWN_ROUND_2, CARDS_DRAWN_ROUND_3 } from './constants.js';
import { triggerHook } from './logic.js';
import { GameState, CardInstance, PlayerRole, EffectContext, GamePhase, Zone } from './types.js';

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
  console.log('Setting new game state:', newState);
  gameState = checkState(newState);
  listeners.forEach(listener => listener(gameState));
}

export function resetGameState(friendlyDeck: CardInstance[], enemyDeck: CardInstance[]) {
  setGameState({
    players: {
      friendly: {
        hand: [],
        deck: [...friendlyDeck],
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
        deck: [...enemyDeck],
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      }
    },
    currentPlayer: 'friendly',
    currentRound: 0,
    phase: GamePhase.Draw,
    turn: {
      hasActivatedAbility: false,
      hasPlayedCard: false
    }
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
        // Trigger onDeath hooks for each dead card
        for (const deadCard of deadCards) {
          newState = triggerHook('onDeath', newState, {
            source: deadCard,
            player: role,
            metadata: {}
          });
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

export function newTurn() {
  const newState = { ...gameState };
  newState.turn = { hasActivatedAbility: false, hasPlayedCard: false };
  newState.currentPlayer = newState.currentPlayer === 'friendly' ? 'enemy' : 'friendly';
  setGameState(newState);
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
        moveToZone(card, Zone.Graveyard);
      });
      row.cards = [];
    });
  });
}

// Moves a card to a specified zone for its owner
//TODO: parameter for triggerHook
export function moveToZone(card: CardInstance, zone: Zone) {
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

export function goToNextPhase() {
  const newState = { ...gameState };
  switch (gameState.phase) {
    case 'draw':
      newState.phase = GamePhase.Mulligan;
      break;
    case 'mulligan':
      newState.phase = GamePhase.Play;
      break;
    case 'play':
      newState.phase = GamePhase.RoundEnd;
      break;
  }
  setGameState(newState);
}

export function setToPhase(phase: GamePhase) {
  const newState = { ...gameState };
  newState.phase = phase;
  setGameState(newState);
}

/**
 * Deals damage to a card, triggers hooks, and returns the new state.
 * @param state The current game state
 * @param targetId The instanceId of the card to damage
 * @param amount The amount of damage to deal
 * @param context The effect context (source, player, etc.)
 */
export function dealDamage(
  state: GameState,
  targetId: string,
  amount: number,
  context: EffectContext
): GameState {
  // Find the card and its owner
  let owner: PlayerRole | null = null;
  let rowIdx = -1;
  let cardIdx = -1;
  let targetCard: CardInstance | null = null;

  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    for (let r = 0; r < state.players[role].rows.length; r++) {
      const row = state.players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === targetId) {
          owner = role;
          rowIdx = r;
          cardIdx = c;
          targetCard = row.cards[c];
          break;
        }
      }
      if (targetCard) break;
    }
    if (targetCard) break;
  }
  if (!targetCard || owner === null) return state; // Card not found

  // Check for immunities, shields, etc. (expand as needed)
  // Example: if (targetCard.statuses.has('immune')) return state;

  // Apply damage
  const newPower = Math.max(0, targetCard.currentPower - amount);
  const damagedCard = { ...targetCard, currentPower: newPower };

  // Replace the card in state
  const newRows = state.players[owner].rows.map((row, rIdx) =>
    rIdx === rowIdx
      ? {
        ...row,
        cards: row.cards.map((card, cIdx) =>
          cIdx === cardIdx ? damagedCard : card
        ),
      }
      : row
  );
  let newState: GameState = {
    ...state,
    players: {
      ...state.players,
      [owner]: {
        ...state.players[owner],
        rows: newRows,
      },
    },
  };

  state = triggerHook('onDamaged', state, {
    ...context,
    metadata: {
      damagedCard: targetCard,
      damageAmount: amount,
    }
  });

  return newState;
}