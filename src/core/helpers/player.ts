import { PlayerRole } from "../types";

export function getOtherPlayer(player: PlayerRole): PlayerRole {
  return player === PlayerRole.White ? PlayerRole.Black : PlayerRole.White;
}

