import { CardDefinition, CardInstance, EffectContext, HookType, PlayerRole } from '../core/types.js';
import { boostCard, dealDamage, getCardController } from './state.js';

export function sourceIsSelf(self: CardInstance, source: CardInstance): boolean {
  return self.instanceId === source.instanceId;
}
export function isFriendlyTurn(self: CardInstance, player: PlayerRole): boolean {
  const cardController = getCardController(self);
  return player === cardController;
}

export const targetsEnemy = (source: CardInstance, target: CardInstance) => {
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

export const cardDefinitions: CardDefinition[] = [
  {
    id: 'card1',
    name: 'Card One',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card One',
  },
  {
    id: 'card2',
    name: 'Card Two',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Two',
  },
  {
    id: 'card3',
    name: 'Card Three',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Three',
  },
  {
    id: 'card4',
    name: 'Card Four',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Four',
  },
  {
    id: 'card5',
    name: 'Card Five',
    type: ['warrior'],
    basePower: 10,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Five',
  },
  {
    id: 'card6',
    name: 'Card Six',
    type: ['warrior'],
    basePower: 6,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Six',
  },
  {
    id: 'card7',
    name: 'Card Seven',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Seven',
  },
  {
    id: 'card8',
    name: 'Card Eight',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Eight',
  },
  {
    id: 'card9',
    name: 'Card Nine',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Nine',
  },
  {
    id: 'card10',
    name: 'Card Ten',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Ten',
  },
  {
    id: 'card11',
    name: 'Card Eleven',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Play: Deal 2 damage to an enemy unit.',
    requiresTarget: true,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (!sourceIsSelf(context.self, context.source)) return;
          dealDamage(context.target, 2, {source: context.self});
        },
        validTargets: targetsEnemy
      }
    ]
  },
  {
    id: 'card12',
    name: 'Card Twelve',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Turn End: Boost this by 3.',
    requiresTarget: false,
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context: EffectContext) => {
          if(!isFriendlyTurn(context.self, context.player)) return;
          boostCard(context.self, 3, {source: context.self});
        }
      }
    ]
  }
];