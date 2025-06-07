import { findCardOnBoard, getGameState, setGameState } from "../state";
import { CardInstance, HookType, StatusEffect, StatusType } from "../types";

export const statusEffects: Record<StatusType, StatusEffect> = {
  locked: {
    type: StatusType.Locked,
    description: 'Card cannot be moved or acted upon',
  },
  veil: {
    type: StatusType.Veil,
    description: 'Card cannot be targeted by enemy effects',
  },
  poisoned: {
    type: StatusType.Poisoned,
    description: 'Card loses 1 power each turn',
    // You could add onTurnStart hooks here for ticking damage
  },
  shield: {
    type: StatusType.Shield,
    description: 'Card has a shield that absorbs the next damage instance',
  },
  doomed: {
    type: StatusType.Doomed,
    description: 'Card does not go to the graveyard when destroyed, but is removed from the game',
    effects: [
      {
        hook: HookType.OnDeath,
        effect: (context) => {
          const { self } = context;
          if (self) {
            // Logic to remove the card from the game
            console.log(`Card ${self.baseCard.name} is doomed and removed from the game.`);
          }
        }
      }
    ]
  },
};

export function getStatusEffect(status: StatusType): StatusEffect {
  return statusEffects[status];
}

export function addStatus(card: CardInstance, status: StatusType): CardInstance {
  const newStatuses = new Set(card.statuses);
  newStatuses.add(status);
  return { ...card, statuses: newStatuses };
}

export function removeStatus(card: CardInstance, status: StatusType): void {
  const newState = {...getGameState()}
  const targetCard = findCardOnBoard(newState, card.instanceId);
  const newStatuses = new Set(targetCard.statuses);
  newStatuses.delete(status);
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

export function hasStatus(card: CardInstance, status: StatusType): boolean {
  return card.statuses.has(status);
}