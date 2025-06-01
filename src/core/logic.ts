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

export function createCardInstance(def: CardDefinition): CardInstance {
  return {
    instanceId: crypto.randomUUID(),
    baseCard: def,
    currentPower: def.basePower,
    statuses: new Set<StatusId>(),
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