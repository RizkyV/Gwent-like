import { PlayerRole } from "../types";

export function getOtherPlayer(player: PlayerRole): PlayerRole {
  return player === PlayerRole.Friendly ? PlayerRole.Enemy : PlayerRole.Friendly;
}

