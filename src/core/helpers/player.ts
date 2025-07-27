import { getGameState } from "../state";
import { PlayerRole } from "../types";

export function getOtherPlayer(player: PlayerRole): PlayerRole {
  return player === PlayerRole.Ivory ? PlayerRole.Obsidian : PlayerRole.Ivory;
}

export function getPlayerHandSize(player: PlayerRole): number {
  return getGameState().players[player].hand.length
}
