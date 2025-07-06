import { CardInstance, PlayerRole, Row, GameState } from "../types";
import { getGameState } from "../state";

export function flipCoin(): boolean {
  return Math.random() < 0.5;
}
export function getRows(state: GameState, player: PlayerRole): Row[] {
  return player === 'white' ? state.players.white.rows : state.players.black.rows;
}
export function setRows(state: GameState, player: PlayerRole, rows: Row[]): GameState {
  return {
    ...state,
    ...(player === 'white'
      ? { whiteRows: rows }
      : { blackRows: rows })
  };
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