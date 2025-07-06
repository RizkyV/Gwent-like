import { getCardPosition, getGameState } from "../state";
import { CardInstance, PlayerRole, Row, Zone } from "../types";

export function getCardController(card: CardInstance): PlayerRole {
  const position = getCardPosition(card);
  return position.player
}

export function getCardZone(card: CardInstance): Zone {
  const position = getCardPosition(card);
  return position.zone;
}

export function isCardInZone(card: CardInstance, zone: Zone): boolean {
  return getCardZone(card) === zone;
}

export function getCardDefCountForPlayer(card: CardInstance, player: PlayerRole): number {
  const cards = [];

  for (let r = 0; r < getGameState().players[player].rows.length; r++) {
    const row = getGameState().players[player].rows[r];
    for (let c = 0; c < row.cards.length; c++) {
      if (row.cards[c].baseCard.id === card.baseCard.id) {
        cards.push(row.cards[c]);
      }
    }
  }
  return cards.length;
}

export function getCardRow(card: CardInstance): Row | null {
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
    for (const row of getGameState().players[role].rows) {
      for (const _card of row.cards) {
        if (_card.instanceId === card.instanceId) {
          return row;
        }
      }
    }
  }
  return null; // Card not found
}

export function getCardRowIndex(card: CardInstance): number | null {
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
    for (let r = 0; r < getGameState().players[role].rows.length; r++) {
      const row = getGameState().players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === card.instanceId) {
          return c;
        }
      }
    }
  }
  return null; // Card not found
}

export function findCardOnBoard(targetId: string): CardInstance | null {
  for (const role of ['ivory', 'obsidian'] as PlayerRole[]) {
    for (let r = 0; r < getGameState().players[role].rows.length; r++) {
      const row = getGameState().players[role].rows[r];
      for (let c = 0; c < row.cards.length; c++) {
        if (row.cards[c].instanceId === targetId) {
          return row.cards[c];
        }
      }
    }
  }
  return null; // Card not found
}