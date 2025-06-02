import { CardInstance, StatusId } from "../types";

export function addStatus(card: CardInstance, status: StatusId): CardInstance {
  const newStatuses = new Set(card.statuses);
  newStatuses.add(status);
  return { ...card, statuses: newStatuses };
}

export function removeStatus(card: CardInstance, status: StatusId): CardInstance {
  const newStatuses = new Set(card.statuses);
  newStatuses.delete(status);
  return { ...card, statuses: newStatuses };
}

export function hasStatus(card: CardInstance, status: StatusId): boolean {
  return card.statuses.has(status);
}