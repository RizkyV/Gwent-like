import { getGameState } from "../state";
import { CardInstance, PlayerRole, Row, RowType } from "../types";

export function getAdjacentCards(card: CardInstance): CardInstance[] {
    const adjacentCards: CardInstance[] = [];

    return adjacentCards;
}

export function getCardRow(card: CardInstance): Row | null {
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
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
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
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
  for (const role of ['friendly', 'enemy'] as PlayerRole[]) {
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