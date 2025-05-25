import { StatusId, StatusEffect, CardInstance, GameState } from './types.js';

export const statusEffects: Record<StatusId, StatusEffect> = {
  locked: {
    id: 'locked',
    description: 'Card cannot be moved or acted upon',
  },
  veil: {
    id: 'veil',
    description: 'Card cannot be targeted by enemy effects',
    canBeTargeted: (card, state) => false,
  },
  poisoned: {
    id: 'poisoned',
    description: 'Card loses 1 power each turn',
    // You could add onTurnStart hooks here for ticking damage
  },
};