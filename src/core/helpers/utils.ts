import { CardInstance, PlayerRole, Row, GameState } from "../types";
import { getGameState } from "../state";
import { getStatusEffect } from "./status";

export function flipCoin(): boolean {
  return Math.random() < 0.5;
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
export function getRowById(rows: Row[], type: 'melee' | 'ranged'): Row | undefined {
  return rows.find(row => row.type === type);
}

export function canTargetCard(card: CardInstance, state: GameState): boolean {
  for (const status of Array.from(card.statuses)) {
   /*  const effect = getStatusEffect(status);
    if (effect?.canBeTargeted && !effect.canBeTargeted(card, state)) {
      return false;
    } */
  }
  return true;
}

export function getPlayerHandSize(player: PlayerRole): number {
  return getGameState().players[player].hand.length // Adjust as needed for different players
}

//TODO: findInZones, 