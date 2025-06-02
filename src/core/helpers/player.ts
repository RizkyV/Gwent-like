import { PlayerRole } from "../types";

export function getOtherPlayer(player: PlayerRole): PlayerRole {
  return player === 'friendly' ? 'enemy' : 'friendly';
}

