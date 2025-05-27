import {
  CardDefinition,
  CardInstance,
  GameState,
  PlayerRole,
  Row,
  StatusId,
  HookType,
  EffectContext
} from './types';
import { statusEffects } from './statuses.js';

//State helper functions
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

export function createCardInstance(def: CardDefinition): CardInstance {
  return {
    instanceId: crypto.randomUUID(),
    baseCard: def,
    currentPower: def.basePower,
    statuses: new Set<StatusId>(),
  };
}

export function resolveCardPlay(card: CardInstance, state: GameState, player: PlayerRole): GameState {
  const effect = card.baseCard.effects?.find(e => e.hook === 'onPlay')?.effect;
  if (!effect) return state;
  return effect(state, { source: card, player });
}

export function drawCards(state: GameState, player: PlayerRole, count: number): GameState {
  const playerState = state.players[player];
  const drawn = playerState.deck.slice(0, count);
  const newDeck = playerState.deck.slice(count);

  return {
    ...state,
    players: {
      ...state.players,
      [player]: {
        ...playerState,
        hand: [...playerState.hand, ...drawn],
        deck: newDeck
      }
    }
  };
}

export function getRows(state: GameState, player: PlayerRole): Row[] {
  return player === 'friendly' ? state.players.friendly.rows : state.players.enemy.rows;
}
export function setRows(state: GameState, player: PlayerRole, rows: Row[]): GameState {
  return {
    ...state,
    ...(player === 'friendly'
      ? { friendlyRows: rows }
      : { enemyRows: rows })
  };
}
export function getRowById(rows: Row[], id: 'melee' | 'ranged'): Row | undefined {
  return rows.find(row => row.id === id);
}

export function addStatus(card: CardInstance, status: StatusId): CardInstance {
  const newStatuses = new Set(card.statuses);
  newStatuses.add(status);
  return { ...card, statuses: newStatuses };
}

export function removeStatus(card: CardInstance, status: StatusId): CardInstance {
  const newStatuses = new Set(card.statuses);
  newStatuses.delete(status);
  return { ...card, statuses: newStatuses };
}

export function hasStatus(card: CardInstance, status: StatusId): boolean {
  return card.statuses.has(status);
}

export function canTargetCard(card: CardInstance, state: GameState): boolean {
  for (const status of Array.from(card.statuses)) {
    const effect = statusEffects[status];
    if (effect?.canBeTargeted && !effect.canBeTargeted(card, state)) {
      return false;
    }
  }
  return true;
}

export function triggerHook(
  hook: HookType,
  state: GameState,
  context: EffectContext
): GameState {
  let newState = state;
  const allCards = [...state.players.friendly.rows, ...state.players.enemy.rows].flatMap(row => row.cards);

  for (const card of allCards) {
    const hookedEffects = card.baseCard.effects?.filter(e => e.hook === hook) || [];
    for (const { effect } of hookedEffects) {
      const scopedContext: EffectContext = {
        ...context,
        source: card,
        player: card.baseCard.isToken ? context.player : getCardOwner(state, card),
      };
      newState = effect(newState, scopedContext);
    }
  }
  return newState;
}

export function getCardOwner(state: GameState, card: CardInstance): PlayerRole {
  const cardId = card.instanceId;
  const friendlyHasCard = state.players.friendly.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );
  if (friendlyHasCard) return 'friendly';
  const enemyHasCard = state.players.enemy.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );
  if (enemyHasCard) return 'enemy';
  throw new Error(`Could not determine owner of card with instanceId: ${cardId}`);
}

export function updateCardInState(
  state: GameState,
  cardId: string,
  updater: (card: CardInstance) => CardInstance
): GameState {
  const updateRows = (rows: Row[]): Row[] =>
    rows.map(row => ({
      ...row,
      cards: row.cards.map(card =>
        card.instanceId === cardId ? updater(card) : card
      )
    }));

  const updatedFriendlyRows = updateRows(state.players.friendly.rows);
  const foundInFriendly = updatedFriendlyRows.some((r, i) =>
    r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.friendly.rows[i].cards[j])
  );
  if (foundInFriendly) {
    return {
      ...state,
      players: {
        ...state.players,
        friendly: {
          ...state.players.friendly,
          rows: updatedFriendlyRows
        }
      }
    };
  }
  const updatedEnemyRows = updateRows(state.players.enemy.rows);
  const foundInEnemy = updatedEnemyRows.some((r, i) =>
    r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.enemy.rows[i].cards[j])
  );
  if (foundInEnemy) {
    return {
      ...state,
      players: {
        ...state.players,
        enemy: {
          ...state.players.enemy,
          rows: updatedEnemyRows
        }
      }
    };
  }
  throw new Error(`Card with instanceId ${cardId} not found in any player's rows.`);
}