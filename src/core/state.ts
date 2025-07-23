import { flipCoin, getPlayerHandSize } from './helpers/utils.js';
import { ALWAYS_IVORY_START_PLAYER, ALWAYS_OBSIDIAN_START_PLAYER, CARDS_DRAWN_ROUND_1, CARDS_DRAWN_ROUND_2, CARDS_DRAWN_ROUND_3 } from './constants.js';
import { GameState, CardInstance, PlayerRole, EffectContext, GamePhase, Zone, HookType, GameConfig, CardDefinition, RowType, Row, CardCategory, PredicateType, StatusType, EffectSource, CardPosition, RowEffectType, RowEffect, HookedEffect } from './types.js';
import { getOtherPlayer } from './helpers/player.js';
import { buildDeck, createCardInstance } from './helpers/deck.js';
import { getStatusEffect } from './helpers/status.js';
import { getCardController, isCardInZone } from './helpers/board.js';
import { cardDefinitions, getEffectSourceCard } from './cards.js';
import { getRowEffect } from './helpers/row.js';
import { setCardPlayingState } from '../ui/ui-helpers.js';

let gameState: GameState | null = null;
let queue: QueueEffect[] = [];
const listeners: Array<(state: GameState | null) => void> = [];

export type QueueEffect = {
  effect: HookedEffect;
  context: EffectContext;
}

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

export function resetGameState(ivoryDeck: CardDefinition[], obsidianDeck: CardDefinition[], config: GameConfig) {
  setGameState({
    players: {
      ivory: {
        hand: [],
        deck: buildDeck(ivoryDeck, PlayerRole.Ivory),
        graveyard: [],
        rows: [
          { type: RowType.Melee, cards: [], player: PlayerRole.Ivory },
          { type: RowType.Ranged, cards: [], player: PlayerRole.Ivory }
        ],
        passed: false,
        roundWins: 0
      },
      obsidian: {
        hand: [],
        deck: buildDeck(obsidianDeck, PlayerRole.Obsidian),
        graveyard: [],
        rows: [
          { type: RowType.Melee, cards: [], player: PlayerRole.Obsidian },
          { type: RowType.Ranged, cards: [], player: PlayerRole.Obsidian }
        ],
        passed: false,
        roundWins: 0
      }
    },
    //TODO: should default to ivory player
    currentPlayer: ALWAYS_IVORY_START_PLAYER ? PlayerRole.Ivory : ALWAYS_OBSIDIAN_START_PLAYER ? PlayerRole.Obsidian : (flipCoin() ? PlayerRole.Ivory : PlayerRole.Obsidian),
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

  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
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
          triggerHook(HookType.OnDeath, { source: { kind: 'card', card: deadCard } });
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
  newState.players.ivory.passed = false;
  newState.players.obsidian.passed = false;
  newState.turn = {
    hasActivatedAbility: false,
    hasPlayedCard: false
  };
  newState.phase = GamePhase.Mulligan;
  setGameState(newState);
  console.log(`Starting round ${newState.currentRound}`);

  //Draw the appropriate number of cards for each player
  (['ivory', 'obsidian'] as PlayerRole[]).forEach(role => {
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
  console.log(`Starting turn ${gameState.currentTurn} for player ${gameState.currentPlayer}`);
  triggerHook(HookType.OnTurnStart, { player: gameState.currentPlayer });
}
export function passTurn(player: PlayerRole) {
  const newState = { ...gameState };
  newState.players[player].passed = true;
  console.log(`${player} passed their turn.`);
  setGameState(newState);
  triggerHook(HookType.OnTurnPass, { player: player })
  //TODO: Dont trigger turn end if it ends the round - therefore move this check to after the checkEndRound in engine - same as endTurn as it passes automatically
  triggerHook(HookType.OnTurnEnd, { player: player })
  checkState();
}
export function endTurn() {
  console.log(`Ending turn for player ${gameState.currentPlayer} - turn number is ${gameState.currentTurn}`);
  const newState = { ...gameState };
  const oldPlayer = newState.currentPlayer;
  const newPlayer = getOtherPlayer(newState.currentPlayer);

  //If active player has no cards in hand, pass their turn instead
  //TODO: actually call passTurn to trigger the correct hooks
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
  const bothPassed = gameState.players.ivory.passed && gameState.players.obsidian.passed;
  const bothHandsEmpty = gameState.players.ivory.hand.length === 0 && gameState.players.obsidian.hand.length === 0;
  if (bothPassed || bothHandsEmpty) {
    return true;
  }
  return false;
}

export function endRound() {
  const newState = { ...gameState };
  //TODO: Trigger onRoundEnd hooks for each player
  const ivoryPoints = gameState.players.ivory.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);
  const obsidianPoints = gameState.players.obsidian.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);

  if (ivoryPoints > obsidianPoints) {
    newState.players.ivory.roundWins += 1;
    console.log(`Round ${gameState.currentRound} goes to Ivory (${ivoryPoints} vs ${obsidianPoints})`);
  } else if (obsidianPoints > ivoryPoints) {
    newState.players.obsidian.roundWins += 1;
    console.log(`Round ${gameState.currentRound} goes to Obsidian (${obsidianPoints} vs ${ivoryPoints})`);
  } else {
    //Both players get a point in case of a tie
    newState.players.ivory.roundWins += 1;
    newState.players.obsidian.roundWins += 1;
    console.log(`Round ${gameState.currentRound} is a tie! (${ivoryPoints} vs ${obsidianPoints})`);
  }
  setGameState(newState);

  //Reset rows for the next round
  //TODO: Check resilience
  (['ivory', 'obsidian'] as PlayerRole[]).forEach(role => {
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
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
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

export function playCard(card: CardInstance, player: PlayerRole, rowType: RowType, index: number, target?: EffectSource): void {
  if (card.baseCard.category !== CardCategory.Special) {
    moveCardToBoard(card, player, rowType, index)
  } else {
    moveToZone(card, player, Zone.Graveyard);
  }
  const newState = { ...gameState };
  newState.turn.hasPlayedCard = true;
  setGameState(newState);
  triggerHook(HookType.OnPlay, { source: { kind: 'card', card }, target });
  triggerHook(HookType.OnSummoned, { source: { kind: 'card', card }, player: player });
  checkState();
}

export function activateAbility(card: CardInstance, target?: EffectSource): void {
  const newState = { ...gameState };
  newState.turn.hasActivatedAbility = true;
  setGameState(newState);
  triggerHook(HookType.OnAbilityActivated, { source: { kind: 'card', card }, target });
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
  //TOOD: always return true if the card is locked.
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

export function initiateCardPlaying(card: CardInstance): void {
  //TODO: flip isValidRow
  //card.baseCard.isValidRow =
  setCardPlayingState(card);
}

export function getPlayerDeck(player: PlayerRole): CardInstance[] {
  return gameState.players[player].deck;
}


/**
 * Gets the cards on board for a player
 * @param player - the player to get cards for
 * @returns 
 */
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

export function getCardPosition(card: CardInstance): CardPosition | null {
  let foundCard: CardInstance | null = null;
  let owner: PlayerRole | null = null;
  let zone: Zone | null = null;
  let rowType: RowType | null = null;
  let foundCardIndex = -1;

  // Find the card in rows, hand, or deck
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
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
  //TODO: dont trigger hooks for locked units
  console.info(`Triggering hook: ${hook}`, context);
  const allCards = [
    ...gameState.players.ivory.rows.flatMap(row => row.cards),
    ...gameState.players.obsidian.rows.flatMap(row => row.cards),
    ...gameState.players.ivory.hand,
    ...gameState.players.obsidian.hand,
    ...gameState.players.ivory.deck,
    ...gameState.players.obsidian.deck,
    ...gameState.players.ivory.graveyard,
    ...gameState.players.obsidian.graveyard,
  ];
  //TODO: ORDER ORDER ORDER
  //Trigger hooks of cards
  for (const card of allCards) {
    const cardEffects = card.baseCard.effects?.filter(e => e.hook === hook) || [];
    for (const effect of cardEffects) {
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
        self: { kind: 'card', card },
      };
      queue.push({effect, context: scopedContext} as QueueEffect);
      //effect.effect(scopedContext);
    }
    //Trigger hooks of statuses
    const statusEffects = card.statuses ? Array.from(card.statuses).flatMap(status => getStatusEffect(status[0]).effects?.filter(e => e.hook === hook) || []) : [];
    for (const effect of statusEffects) {
      const zoneCheck =
        typeof effect.zone === 'function'
          ? effect.zone(context)
          : effect.zone
            ? isCardInZone(card, effect.zone)
            : isCardInZone(card, Zone.RowMelee) || isCardInZone(card, Zone.RowRanged);
      if (!zoneCheck) continue;

      const scopedContext: EffectContext = {
        ...context,
        self: { kind: 'card', card },
      };
      queue.push({effect, context: scopedContext} as QueueEffect);
      //effect.effect(scopedContext);
    }
  }
  //Trigger hooks of row effects
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
    const rows = gameState.players[role].rows;
    for (const row of rows) {
      if (row && row.effects) {
        for (const rowEffect of row.effects) {
          for (const rowEffectsEffect of rowEffect.effects) {
            if( rowEffectsEffect.hook !== hook) continue;
            const scopedContext: EffectContext = {
              ...context,
              self: { kind: 'rowEffect', type: rowEffect.type, row },
            };
            queue.push({effect: rowEffectsEffect, context: scopedContext} as QueueEffect);
            //rowEffectsEffect.effect(scopedContext);
          }
        }
      }
    }
  }

  while (queue.length > 0) {
    const queuedEffect = queue.shift();
    if (!queuedEffect) continue;
    const { effect, context } = queuedEffect;
    effect.effect(context);
  }
}

export function addStatus(card: CardInstance, status: StatusType, duration?: number): void {
  const newState = { ...gameState }
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
  const newState = { ...gameState }
  const targetCard = findCardOnBoardInState(newState, card.instanceId);
  const newStatuses = new Map(targetCard.statuses);
  newStatuses.delete(status);
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

export function addRowEffect(player: PlayerRole, rowType: RowType, rowEffect: RowEffectType, duration: number): void {
  const newState = { ...gameState }
  const weatherEffect = getRowEffect(rowEffect);
  if (!weatherEffect) return;
  //TODO: increase duration if already exists
  weatherEffect.duration = duration;
  const row = newState.players[player].rows.find(row => row.type === rowType);
  if (!row.effects) {
    row.effects = [weatherEffect];
  } else {
    row.effects.push(weatherEffect);
  }
  setGameState(newState);
}

export function getHighestCards(): CardInstance[] | null {
  let highestCards: CardInstance[] = [];
  let highestPower = Infinity;
  const cards = [...getPlayerCards(PlayerRole.Ivory), ...getPlayerCards(PlayerRole.Obsidian)];
  //Determine the highest power
  for (const card of cards) {
    if (card.currentPower >= highestPower) {
      highestPower = card.currentPower;
    }
  }
  //Get all valid cards
  for (const card of cards) {
    if (card.currentPower >= highestPower) {
      highestCards.push(card);
    }
  }
  if (highestCards.length === 0) return null; // No valid cards found
  return highestCards;
}
export function getHighestCard(): CardInstance | null {
  const highestCards = getHighestCards();
  if (highestCards === null || highestCards.length === 0) return null;
  //Return a card randomly chosen from the highest cards
  return highestCards[Math.floor(Math.random() * highestCards.length)];
}
export function getLowestCards(): CardInstance[] | null {
  let lowestCards: CardInstance[] = [];
  let lowestPower = Infinity;
  const cards = [...getPlayerCards(PlayerRole.Ivory), ...getPlayerCards(PlayerRole.Obsidian)];
  //Determine the lowest power
  for (const card of cards) {
    if (card.currentPower <= lowestPower) {
      lowestPower = card.currentPower;
    }
  }
  //Get all valid cards
  for (const card of cards) {
    if (card.currentPower <= lowestPower) {
      lowestCards.push(card);
    }
  }
  if (lowestCards.length === 0) return null; // No valid cards found
  return lowestCards;
}
export function getLowestCard(): CardInstance | null {
  const lowestCards = getLowestCards();
  if (lowestCards === null || lowestCards.length === 0) return null;
  //Return a card randomly chosen from the lowest cards
  return lowestCards[Math.floor(Math.random() * lowestCards.length)];
}

export function getRow(player: PlayerRole, type: RowType): Row | null {
  const row = gameState.players[player].rows.find(r => r.type === type);
  return row || null;
}

export function tickStatusDurations(card: CardInstance): void {
  const newState = { ...gameState };
  card = findCardOnBoardInState(newState, card.instanceId);
  if (!card) {
    console.warn(`Card with instanceId ${card.instanceId} not found in game state.`);
    return;
  }
  let changed = false;
  const newStatuses = new Map(card.statuses);
  for (const [status, statusObj] of card.statuses.entries()) {
    if (statusObj.duration !== undefined) {
      if (statusObj.duration <= 1) {
        newStatuses.delete(status);
        changed = true;
      } else {
        newStatuses.set(status, { ...statusObj, duration: statusObj.duration - 1 });
        changed = true;
      }
    }
  }
  if (changed) {
    card.statuses = newStatuses;
  }
  setGameState(newState);
}

export function tickRowEffectDuration(row: Row): void {
  const newState = { ...gameState };
  row = newState.players[row.player].rows.find(r => r.type === row.type);
  if (!row) return;
  row.effects[0].duration -= 1; //Tick down the active effect
  if (row.effects[0].duration <= 0) {
    //Remove the effect if duration is over
    row.effects.shift();
  }
  setGameState(newState);
}

/**
 * Deals damage to a card and triggers hooks
 * @param targetId The instanceId of the card to damage
 * @param amount The amount of damage to deal
 * @param context The effect context (source, player, etc.)
 */
export function dealDamage(target: CardInstance, amount: number, source: EffectSource): void {
  const newState = { ...gameState };
  //Find the target card in the game state
  const targetCard = findCardOnBoardInState(newState, target.instanceId);

  //1 - Check for innate card effects
  //2 - Check for statuses
  //3 - Check for armor

  // Apply damage
  const newPower = Math.max(0, targetCard.currentPower - amount);
  targetCard.currentPower = newPower;
  const damagedAmount = targetCard.currentPower - newPower;
  setGameState(newState);
  triggerHook(HookType.OnDamaged, {
    source: { kind: 'card', card: target },
    trigger: source,
    amount: damagedAmount
  });
}

export function boostCard(target: CardInstance, amount: number, source: EffectSource): void {
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
    target: { kind: 'card', card: targetCard },
    amount: boostedAmount
  });
}

export function spawnCard(target: CardDefinition, row: Row, index: number, source: EffectSource): void {
  const newState = { ...gameState };
  //TODO: check for all sort of stuff
  //TODO: if source does not resolve to a card - find another way of getting the player
  const sourceCard = getEffectSourceCard(source);
  const player = getCardController(sourceCard);
  const newCard = createCardInstance(target, player)
  const targetRow = newState.players[player].rows.find(_row => _row.type === row.type);
  targetRow.cards.splice(index, 0, newCard)
  setGameState(newState);
  triggerHook(HookType.OnSummoned, {
    source: source,
    player: player
  })
}

export function drawCard(player: PlayerRole, source?: EffectSource) {
  const newState = { ...gameState };
  const playerState = gameState.players[player];
  const drawn = playerState.deck[0];
  if (drawn) {
    const newDeck = playerState.deck.slice(1);
    newState.players[player].deck = newDeck;
    newState.players[player].hand = [...playerState.hand, drawn];
    console.log(`${player} drew a card.`);
    setGameState(newState);
    triggerHook(HookType.OnDraw, { source: { kind: 'card', card: drawn }, trigger: source });
  } else {
    console.log(`${player}'s deck is empty - cannot draw a card`);
  }
}

/**
 * State builder helpers
 */
export function findCardOnBoardInState(state: GameState, targetId: string): CardInstance | null {
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
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
  const newCard = createCardInstance(cardDef, PlayerRole.Ivory);
  newState.players.ivory.hand = [...newState.players.ivory.hand, newCard];
  setGameState(newState);
  return newCard;
}
(window as any).addCardToPlayerHand = addCardToPlayerHand; //Expose it to the console