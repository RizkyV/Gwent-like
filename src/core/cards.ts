import { CardDefinition, CardInstance, EffectContext, HookType, PlayerRole } from '../core/types.js';
import { getCardRow, getCardRowIndex } from './helpers/board.js';
import { boostCard, dealDamage, getCardController, spawnCard, triggerHook } from './state.js';
/**
 * Helpers
 */
export function sourceIsSelf(self: CardInstance, source: CardInstance): boolean {
  return self.instanceId === source.instanceId;
}
export function isFriendlyTurn(self: CardInstance, player: PlayerRole): boolean {
  const cardController = getCardController(self);
  return player === cardController;
}

export function isFriendlyRow(source: CardInstance, player: PlayerRole): boolean {
  return getCardController(source) === player;
}

export const isEnemy = (source: CardInstance, target: CardInstance) => {
  //TODO: also check if it is on the board.
  if (getCardController(source) !== getCardController(target)) {
    return true;
  } else {
    return false;
  }
}

/**
* Effects
*/
export function canThrive(context: EffectContext): boolean {
  if (sourceIsSelf(context.self, context.source)) return false;
  if (!isFriendlyRow(context.source, getCardController(context.self))) return false;
  if (context.source.currentPower < context.self.currentPower) return false;
  return true;
}
const thrive1 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (canThrive(context)) {
      boostCard(context.self, 1, { source: context.self });
      triggerHook(HookType.OnThriveTrigger, { source: context.self });
    }
  }
}
const thrive2 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (canThrive(context)) {
      boostCard(context.self, 2, { source: context.self });
      triggerHook(HookType.OnThriveTrigger, { source: context.self });
    }
  }
}


export const cardDefinitions: CardDefinition[] = [
  {
    id: 'token_cow',
    name: 'Cow',
    type: ['Cow', 'Token'],
    rarity: 'bronze',
    basePower: 1,
    category: 'unit',
    provisionCost: 0,
    description: '',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card2',
    name: 'Card Two',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Two',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card3',
    name: 'Card Three',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Three',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card4',
    name: 'Card Four',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Four',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card5',
    name: 'Card Five',
    type: ['warrior'],
    basePower: 10,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Five',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card6',
    name: 'Card Six',
    type: ['warrior'],
    basePower: 6,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Six',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card7',
    name: 'Card Seven',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Seven',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card8',
    name: 'Card Eight',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Eight',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card9',
    name: 'Card Nine',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Nine',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card10',
    name: 'Card Ten',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Ten',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card11',
    name: 'Card Eleven',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Play: Deal 2 damage to an enemy unit.',
    //artworkUrl: '/assets/cards/card11.png',
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context.self, context.source)) {
            dealDamage(context.target, 2, { source: context.self });
          }
        },
        validTargets: isEnemy
      }
    ],
    isValidRow: isFriendlyRow
  },
  {
    id: 'card12',
    name: 'Card Twelve',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Turn End: Boost this by 1.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context: EffectContext) => {
          if (isFriendlyTurn(context.self, context.player)) {
            boostCard(context.self, 1, { source: context.self });
          }
        }
      }
    ],
    isValidRow: isFriendlyRow
  },
  {
    id: 'unit_nekker',
    name: 'Nekker',
    type: ['monster'],
    basePower: 1,
    category: 'unit',
    provisionCost: 4,
    description: 'Thrive. Play: Spawn a base copy of self on this row',
    effects: [
      thrive1,
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          // Spawn a base copy of self on this row
          if (sourceIsSelf(context.self, context.source)) {
            spawnCard(context.self.baseCard, getCardRow(context.self), getCardRowIndex(context.self) + 1, { player: getCardController(context.self), source: context.self });
          }
        }
      }
    ],
    isValidRow: isFriendlyRow
  }
];