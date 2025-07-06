import { PlayerRole } from "../types";

export function getOtherPlayer(player: PlayerRole): PlayerRole {
  return player === PlayerRole.Ivory ? PlayerRole.Obsidian : PlayerRole.Ivory;
}

