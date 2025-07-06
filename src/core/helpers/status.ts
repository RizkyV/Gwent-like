import { getEffectSourceCard } from "../cards";
import { boostCard, dealDamage } from "../state";
import { CardInstance, HookType, StatusEffect, StatusType } from "../types";
import { getCardController } from "./board";

export const statusEffects: Record<StatusType, StatusEffect> = {
  decay: {
    type: StatusType.Decay,
    description: 'Deal 1 damage to self at end of your turn, and lower Decay by 1',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (hasStatus(self, StatusType.Decay) && getCardController(self) === context.player) {
            // Deal 1 damage
            dealDamage(self, 1, context.self);
            // Tick duration
            tickStatusDurations(self);
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
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (hasStatus(self, StatusType.Decay) && getCardController(self) === context.player) {
            // Deal 1 damage
            boostCard(self, 1, context.self);
            // Tick duration
            tickStatusDurations(self);
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
          const self = getEffectSourceCard(context.self);
          if (!self) return;
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

export function hasStatus(card: CardInstance, status: StatusType): boolean {
  return card.statuses.has(status);
}

export function getStatusDuration(card: CardInstance, status: StatusType): number | undefined {
  return card.statuses.get(status)?.duration;
}

export function tickStatusDurations(card: CardInstance): void {
  //TODO: Needs to go through setGameState
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