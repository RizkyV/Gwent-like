import { boostCard, dealDamage, findCardOnBoard, getCardController, getGameState, setGameState } from "../state";
import { CardInstance, HookType, StatusEffect, StatusType } from "../types";

export const statusEffects: Record<StatusType, StatusEffect> = {
  decay: {
    type: StatusType.Decay,
    description: 'Deal 1 damage to self at end of your turn, and lower Decay by 1',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          if (hasStatus(context.self, StatusType.Decay) && getCardController(context.self) === context.player) {
            // Deal 1 damage
            dealDamage(context.self, 1, context.self);
            // Tick duration
            tickStatusDurations(context.self);
          }
        }
      }
    ]
  },
  vitality: {
    type: StatusType.Vitality,
    description: 'Boost self by 1 at end of your turn, and lower Vitality by 1',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          if (hasStatus(context.self, StatusType.Decay) && getCardController(context.self) === context.player) {
            // Deal 1 damage
            boostCard(context.self, 1, context.self);
            // Tick duration
            tickStatusDurations(context.self);
          }
        }
      }
    ]
  },
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

export function addStatus(card: CardInstance, status: StatusType, duration?: number): void {
  const newState = { ...getGameState() }
  const targetCard = findCardOnBoard(newState, card.instanceId);
  const newStatuses = new Map(targetCard.statuses);

  //Decay/Vitality interaction
  if (status === StatusType.Decay || status === StatusType.Vitality) {
    const opposite = status === StatusType.Decay ? StatusType.Vitality : StatusType.Decay;
    if (newStatuses.has(status)) {
      // If same status exists, add to duration
      const prev = newStatuses.get(status);
      const prevDuration = prev?.duration ?? 0;
      newStatuses.set(status, { type: status, duration: (prevDuration || 0) + (duration || 0) });
    } else if (newStatuses.has(opposite)) {
      // If opposite status exists, cancel out
      const prev = newStatuses.get(opposite);
      const prevDuration = prev?.duration ?? 0;
      const diff = (prevDuration || 0) - (duration || 0);
      if (diff > 0) {
        // Opposite remains with reduced duration
        newStatuses.set(opposite, { type: opposite, duration: diff });
      } else if (diff < 0) {
        // New status remains with leftover duration
        newStatuses.delete(opposite);
        newStatuses.set(status, { type: status, duration: -diff });
      } else {
        // Both cancel out
        newStatuses.delete(opposite);
      }
    } else {
      // No existing, just add
      newStatuses.set(status, { type: status, duration });
    }
  } else {
    // Non-duration or non-interacting status
    newStatuses.set(status, { type: status, duration });
  }
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

export function removeStatus(card: CardInstance, status: StatusType): void {
  const newState = { ...getGameState() }
  const targetCard = findCardOnBoard(newState, card.instanceId);
  const newStatuses = new Map(targetCard.statuses);
  newStatuses.delete(status);
  targetCard.statuses = newStatuses;
  setGameState(newState);
}

export function hasStatus(card: CardInstance, status: StatusType): boolean {
  return card.statuses.has(status);
}

export function getStatusDuration(card: CardInstance, status: StatusType): number | undefined {
  return card.statuses.get(status)?.duration;
}

export function tickStatusDurations(card: CardInstance): void {
  let changed = false;
  const newStatuses = new Map(card.statuses);
  for (const [status, statusObj] of card.statuses.entries()) {
    if (statusObj.duration !== undefined) {
      if (statusObj.duration <= 1) {
        newStatuses.delete(status);
        changed = true;
      } else {
        newStatuses.set(status, { ...statusObj, duration: statusObj.duration - 1 });
        changed = true;
      }
    }
  }
  if (changed) {
    card.statuses = newStatuses;
  }
}