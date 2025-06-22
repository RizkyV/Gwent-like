import { flipCoin, getPlayerHandSize } from './helpers/utils.js';
import { ALWAYS_ENEMY_START_PLAYER, ALWAYS_FRIENDLY_START_PLAYER, CARDS_DRAWN_ROUND_1, CARDS_DRAWN_ROUND_2, CARDS_DRAWN_ROUND_3 } from './constants.js';
import { GameState, CardInstance, PlayerRole, EffectContext, GamePhase, Zone, HookType, GameConfig, CardDefinition, RowType, Row, CardCategory, PredicateType, StatusType } from './types.js';
import { getOtherPlayer } from './helpers/player.js';
import { buildDeck, createCardInstance } from './helpers/deck.js';
import { getStatusEffect } from './helpers/status.js';
import { getCardController, getCardDefCountForPlayer, isCardInZone } from './helpers/board.js';
import { cardDefinitions } from './cards.js';

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
  gameState = newState;
  listeners.forEach(listener => listener(gameState));
}

export function resetGameState(friendlyDeck: CardDefinition[], enemyDeck: CardDefinition[], config: GameConfig) {
  setGameState({
    players: {
      friendly: {
        hand: [],
        deck: buildDeck(friendlyDeck, PlayerRole.Friendly),
        graveyard: [],
        rows: [
          { type: RowType.Melee, cards: [], player: PlayerRole.Friendly },
          { type: RowType.Ranged, cards: [], player: PlayerRole.Friendly }
        ],
        passed: false,
        roundWins: 0
      },
      enemy: {
        hand: [],
        deck: buildDeck(enemyDeck, PlayerRole.Enemy),
        graveyard: [],
        rows: [
          { type: RowType.Melee, cards: [], player: PlayerRole.Enemy },
          { type: RowType.Ranged, cards: [], player: PlayerRole.Enemy }
        ],
        passed: false,
        roundWins: 0
      }
    },
    currentPlayer: ALWAYS_FRIENDLY_START_PLAYER ? PlayerRole.Friendly : ALWAYS_ENEMY_START_PLAYER ? PlayerRole.Enemy : (flipCoin() ? PlayerRole.Friendly : PlayerRole.Enemy),
    currentRound: 0,
    phase: GamePhase.Draw,
    turn: {
      hasActivatedAbility: false,
      hasPlayedCard: false
    },
    currentTurn: 0,
    GameConfig: config
  });
}

/**
 * Checks that the state is valid (no 0 power units, etc.) - and cleans up if it isnt
 */
export function checkState(): void {
  //TODO: reset instance ability state - like cooldown, charges, ability used - BUT NOT COUNTER
  let newState = { ...gameState };

  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    for (let rowIdx = 0; rowIdx < newState.players[role].rows.length; rowIdx++) {
      const row = newState.players[role].rows[rowIdx];
      // Find dead units (unit power <= 0)
      const deadCards = row.cards.filter(card => card.currentPower <= 0 && card.baseCard.category === CardCategory.Unit);
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
          triggerHook(HookType.OnDeath, { source: deadCard });
        }
      }
    }
  }
  setGameState(newState);
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
    for (var i = 0; i < cardsToDraw; i++) {
      drawCard(role);
    }
  });
  triggerHook(HookType.OnRoundStart, {});
}

export function mulliganCards() {
  //TODO: Implement mulligan logic
  console.log('Mulligan phase not implemented yet - Skipping to play phase.');
  const newState = { ...gameState };
  newState.phase = GamePhase.Play;
  setGameState(newState);
}

export function startTurn() {
  triggerHook(HookType.OnTurnStart, { player: gameState.currentPlayer });
}
export function passTurn(player: PlayerRole) {
  const newState = { ...gameState };
  newState.players[player].passed = true;
  console.log(`${player} passed their turn.`);
  setGameState(newState);
  triggerHook(HookType.OnTurnPass, { player: player })
  triggerHook(HookType.OnTurnEnd, { player: player })
  checkState();
}
export function endTurn() {
  const newState = { ...gameState };
  const oldPlayer = newState.currentPlayer;
  const newPlayer = getOtherPlayer(newState.currentPlayer);

  //If active player has no cards in hand, pass their turn instead
  if (getPlayerHandSize(oldPlayer) === 0) {
    console.log(`${oldPlayer} has no cards in hand, passing turn.`);
    newState.players[oldPlayer].passed = true;
  }

  //If the non-active player has passed, do not flip to them
  if (!newState.players[newPlayer].passed) {
    newState.currentPlayer = newPlayer;
  } else {
    console.log(`${newPlayer} has passed, turn will not flip to them.`);
  }

  newState.turn = { hasActivatedAbility: false, hasPlayedCard: false };
  newState.currentTurn += 1;
  setGameState(newState);
  triggerHook(HookType.OnTurnEnd, { player: oldPlayer });

  //Trigger the Turn hooks for players who have passed and therefore do not get a real turn
  if (newState.currentPlayer === oldPlayer) {
    triggerHook(HookType.OnTurnStart, { player: newPlayer });
    triggerHook(HookType.OnTurnEnd, { player: newPlayer });
  }
  checkState();
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
  //TODO: FIX THIS
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
        ((zone === Zone.RowMelee && row.type === RowType.Melee) || (zone === Zone.RowRanged && row.type === RowType.Ranged))
          ? { ...row, cards: [...row.cards, card] }
          : row
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

export function playCard(card: CardInstance, player: PlayerRole, rowType: RowType, index: number, target?: CardInstance): void {
  if (card.baseCard.category !== CardCategory.Special) {
    moveCardToBoard(card, player, rowType, index)
  } else {
    moveToZone(card, player, Zone.Graveyard);
  }
  const newState = { ...gameState };
  newState.turn.hasPlayedCard = true;
  setGameState(newState);
  triggerHook(HookType.OnPlay, { source: card, target: target });
  triggerHook(HookType.OnSummoned, { source: card, player: player });
  checkState();
}

export function activateAbility(card: CardInstance, target?: CardInstance): void {
  const newState = { ...gameState };
  newState.turn.hasActivatedAbility = true;
  setGameState(newState);
  triggerHook(HookType.OnAbilityActivated, { source: card, target: target });
  checkState();
}

export function activatedAbility(card: CardInstance, cooldown?: number): void {
  const newState = { ...gameState };
  const _card = findCardOnBoardInState(newState, card.instanceId);
  _card.abilityUsed = true;
  _card.abilityCounter += 1;
  _card.abilityCooldown = cooldown ?? 0;
  if (_card.abilityCharges > 0) _card.abilityCharges -= 1;
  setGameState(newState);
}

export function canActivateAbility(card: CardInstance): boolean {
  console.log(card);
  //if played this turn
  if (card.enteredTurn && card.enteredTurn === gameState.currentTurn) {
    //check whether affected by summoning sickness
    if (checkPredicate(card, PredicateType.affectedBySummoningSickness)) {
      return false;
    }
  }
  if (card.baseCard.abilityOneTimeUse && card.abilityUsed) return false;
  if (card.abilityCounter !== undefined && card.abilityCounter >= card.baseCard.abilityMaxCounter) return false;
  if (card.abilityCooldown !== undefined && card.abilityCooldown > 0) return false;
  if (card.abilityCharges !== undefined && card.abilityCharges === 0) return false;
  return true;
}
//returns true if default behavior (predicate doesnt change anything)
export function checkPredicate(card: CardInstance, predicateType: PredicateType, context?: EffectContext): boolean {
  //TODO: also check statuses like hook trigger
  const predicate = card.baseCard?.predicates?.find(predicate => predicate.type === predicateType);
  if (predicate) {
    return predicate.check(context);
  }
  return true;
}

export function decrementCooldown(card: CardInstance): void {
  const newState = { ...gameState };
  const _card = findCardOnBoardInState(newState, card.instanceId);
  if (_card.abilityCooldown !== undefined && _card.abilityCooldown > 0) {
    _card.abilityCooldown -= 1;
    setGameState(newState);
  }
}



export function getPlayerCards(player: PlayerRole): CardInstance[] {
  return gameState.players[player].rows.flatMap(row => row.cards);
}
/**
 * 
 * @param card 
 * @param player - the players row to play it on 
 * @param rowType
 * @param index 
 */
export function moveCardToBoard(card: CardInstance, player: PlayerRole, rowType: RowType, index: number): void {
  const newState = { ...gameState };

  const position = getCardPosition(card);
  if (position) {
    //Remove card from its current position
    switch (position.zone) {
      case Zone.Hand:
        newState.players[position.player].hand = newState.players[position.player].hand.filter(c => c.instanceId !== card.instanceId);
        break;
      case Zone.Deck:
        newState.players[position.player].deck = newState.players[position.player].deck.filter(c => c.instanceId !== card.instanceId);
        break;
      case Zone.Graveyard:
        newState.players[position.player].graveyard = newState.players[position.player].graveyard.filter(c => c.instanceId !== card.instanceId);
        break;
      case Zone.RowMelee:
        newState.players[position.player].rows = newState.players[position.player].rows.map(row =>
          row.type === RowType.Melee ? { ...row, cards: row.cards.filter(c => c.instanceId !== card.instanceId) } : row
        );
        break;
      case Zone.RowRanged:
        newState.players[position.player].rows = newState.players[position.player].rows.map(row =>
          row.type === RowType.Ranged ? { ...row, cards: row.cards.filter(c => c.instanceId !== card.instanceId) } : row
        );
        break;
      default:
        console.warn(`Unknown zone for card ${card.instanceId}: ${position.zone}`);
    }
    card.enteredTurn = gameState.currentTurn;
    //Add to the specified row
    const targetRow = newState.players[player].rows.find(row => row.type === rowType);
    targetRow.cards.splice(index, 0, card)
  }

  setGameState(newState)
}
export type CardPosition = {
  card: CardInstance;
  player: PlayerRole;
  zone: Zone;
  rowType?: RowType;
  index?: number;
}
export function getCardPosition(card: CardInstance): CardPosition | null {
  let foundCard: CardInstance | null = null;
  let owner: PlayerRole | null = null;
  let zone: Zone | null = null;
  let rowType: RowType | null = null;
  let foundCardIndex = -1;

  // Find the card in rows, hand, or deck
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
    //Row
    for (let r = 0; r < gameState.players[role].rows.length; r++) {
      const row = gameState.players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === card.instanceId) {
          foundCard = row.cards[c];
          owner = role;
          zone = row.type === RowType.Melee ? Zone.RowMelee : Zone.RowRanged;
          rowType = row.type;
          foundCardIndex = c;
          break;
        }
      }
      if (owner) break;
    }
    //Hand
    const hand = gameState.players[role].hand;
    for (let c = 0; c < hand.length; c++) {
      if (hand[c].instanceId === card.instanceId) {
        foundCard = hand[c];
        owner = role;
        zone = Zone.Hand;
        foundCardIndex = c;
        break;
      }
    }
    //Deck
    const deck = gameState.players[role].deck;
    for (let c = 0; c < deck.length; c++) {
      if (deck[c].instanceId === card.instanceId) {
        foundCard = deck[c];
        owner = role;
        zone = Zone.Deck;
        foundCardIndex = c;
        break;
      }
    }
    //Graveyard
    const graveyard = gameState.players[role].graveyard;
    for (let c = 0; c < graveyard.length; c++) {
      if (graveyard[c].instanceId === card.instanceId) {
        foundCard = graveyard[c];
        owner = role;
        zone = Zone.Graveyard;
        foundCardIndex = c;
        break;
      }
    }
  }
  //Not found
  if (!foundCard) return null;

  const cardPosition: CardPosition = {
    card: foundCard,
    player: owner,
    zone: zone,
    rowType: rowType,
    index: foundCardIndex
  }

  return cardPosition
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
  const allCards = [
    ...gameState.players.friendly.rows.flatMap(row => row.cards),
    ...gameState.players.enemy.rows.flatMap(row => row.cards),
    ...gameState.players.friendly.hand,
    ...gameState.players.enemy.hand,
    ...gameState.players.friendly.deck,
    ...gameState.players.enemy.deck,
    ...gameState.players.friendly.graveyard,
    ...gameState.players.enemy.graveyard,
  ];
  //TODO: ORDER ORDER ORDER

  for (const card of allCards) {
    const hookedEffects = card.baseCard.effects?.filter(e => e.hook === hook) || [];
    const statuses = card.statuses ? Array.from(card.statuses).flatMap(status => getStatusEffect(status[0]).effects?.filter(e => e.hook === hook) || []) : [];
    hookedEffects.push(...statuses)
    for (const effect of hookedEffects) {
      // Default: only trigger if card is on board, unless effect.zone says otherwise
      const zoneCheck =
        typeof effect.zone === 'function'
          ? effect.zone(context)
          : effect.zone
            ? isCardInZone(card, effect.zone)
            : isCardInZone(card, Zone.RowMelee) || isCardInZone(card, Zone.RowRanged);
      if (!zoneCheck) continue;
      const scopedContext: EffectContext = {
        ...context,
        self: card,
      };
      effect.effect(scopedContext);
    }
  }
}

export function addStatus(card: CardInstance, status: StatusType, duration?: number): void {
  const newState = { ...getGameState() }
  const targetCard = findCardOnBoardInState(newState, card.instanceId);
  const newStatuses = new Map(targetCard.statuses);

  //Decay/Vitality interaction
  if (status === StatusType.Decay || status === StatusType.Vitality) {
    const opposite = status === StatusType.Decay ? StatusType.Vitality : StatusType.Decay;
    if (newStatuses.has(status)) {
      // If same status exists, add to duration
      const prev = newStatuses.get(status);
      const prevDuration = prev?.duration ?? 0;
      newStatuses.set(status, { type: status, duration: (prevDuration || 0) + (duration || 0) });
    } else if (newStatuses.has(opposite)) {
      // If opposite status exists, cancel out
      const prev = newStatuses.get(opposite);
      const prevDuration = prev?.duration ?? 0;
      const diff = (prevDuration || 0) - (duration || 0);
      if (diff > 0) {
        // Opposite remains with reduced duration
        newStatuses.set(opposite, { type: opposite, duration: diff });
      } else if (diff < 0) {
        // New status remains with leftover duration
        newStatuses.delete(opposite);
        newStatuses.set(status, { type: status, duration: -diff });
      } else {
        // Both cancel out
        newStatuses.delete(opposite);
      }
    } else {
      // No existing, just add
      newStatuses.set(status, { type: status, duration });
    }
  } else {
    // Non-duration or non-interacting status
    newStatuses.set(status, { type: status, duration });
  }
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

export function removeStatus(card: CardInstance, status: StatusType): void {
  const newState = { ...getGameState() }
  const targetCard = findCardOnBoardInState(newState, card.instanceId);
  const newStatuses = new Map(targetCard.statuses);
  newStatuses.delete(status);
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

/**
 * Deals damage to a card and triggers hooks
 * @param targetId The instanceId of the card to damage
 * @param amount The amount of damage to deal
 * @param context The effect context (source, player, etc.)
 */
export function dealDamage(target: CardInstance, amount: number, source: CardInstance): void {
  const newState = { ...gameState };
  //Find the target card in the game state
  const targetCard = findCardOnBoardInState(newState, target.instanceId);

  // Check for immunities, shields, etc. (expand as needed)
  // Example: if (targetCard.statuses.has('immune')) return state;
  // Check for armor

  // Apply damage
  const newPower = Math.max(0, targetCard.currentPower - amount);
  targetCard.currentPower = newPower;
  const damagedAmount = targetCard.currentPower - newPower;
  setGameState(newState);
  //TODO: send along the source
  triggerHook(HookType.OnDamaged, {
    source: source,
    target: targetCard,
    amount: damagedAmount
  });
}

export function boostCard(target: CardInstance, amount: number, source: CardInstance): void {
  const newState = { ...gameState };
  //Find the target card in the game state
  const targetCard = findCardOnBoardInState(newState, target.instanceId);

  //TODO: check for all sort of stuff

  // Apply boost
  const newPower = targetCard.currentPower + amount;
  targetCard.currentPower = newPower;
  const boostedAmount = newPower - targetCard.currentPower;
  setGameState(newState);
  //TODO: send along the source
  triggerHook(HookType.OnBoosted, {
    source: source,
    target: targetCard,
    amount: boostedAmount
  });
}

export function spawnCard(target: CardDefinition, row: Row, index: number, source: CardInstance): void {
  const newState = { ...gameState };
  //TODO: check for all sort of stuff
  const player = getCardController(source);
  const newCard = createCardInstance(target, player)
  const targetRow = newState.players[player].rows.find(_row => _row.type === row.type);
  targetRow.cards.splice(index, 0, newCard)
  setGameState(newState);
  triggerHook(HookType.OnSummoned, {
    source: source,
    player: player
  })
}

export function drawCard(player: PlayerRole, source?: CardInstance) {
  const newState = { ...gameState };
  const playerState = gameState.players[player];
  const drawn = playerState.deck[0];
  if (drawn) {
    const newDeck = playerState.deck.slice(1);
    newState.players[player].deck = newDeck;
    newState.players[player].hand = [...playerState.hand, drawn];
    console.log(`${player} drew a card.`);
    setGameState(newState);
    triggerHook(HookType.OnDraw, { source: drawn, trigger: source });
  } else {
    console.log(`${player}'s deck is empty - cannot draw a card`);
  }
}

/**
 * State builder helpers
 */

export function findCardOnBoardInState(state: GameState, targetId: string): CardInstance | null {
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

/**
 * Console Commands
 */
export function addCardToPlayerHand(cardId: string): CardInstance | null {
  const cardDef = cardDefinitions.find(card => card.id === cardId);
  if (!cardDef) {
    console.warn("No card with id", cardId);
    return null;
  }
  const newState = { ...gameState };
  const newCard = createCardInstance(cardDef, PlayerRole.Friendly);
  newState.players.friendly.hand = [...newState.players.friendly.hand, newCard];
  setGameState(newState);
  return newCard;
}
(window as any).addCardToPlayerHand = addCardToPlayerHand; //Expose it to the console