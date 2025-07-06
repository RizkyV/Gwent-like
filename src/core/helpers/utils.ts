import { PlayerRole } from "../types";
import { getGameState } from "../state";

export function flipCoin(): boolean {
  return Math.random() < 0.5;
}

export function getPlayerHandSize(player: PlayerRole): number {
  return getGameState().players[player].hand.length
}