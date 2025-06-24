import { CardCategory, CardColor, CardDefinition, CardInstance, CardRarity, CardTypeCategory, EffectContext, HookType, PlayerRole, PredicateType, StatusType, Zone } from '../core/types.js';
import { getCardController, getCardRow, getCardRowIndex } from './helpers/board.js';
import { cardIsType, getCardBasePower, getCardTypes, isBonded } from './helpers/card.js';
import { activatedAbility, addStatus, boostCard, dealDamage, decrementCooldown, getCardPosition, getPlayerCards, removeStatus, spawnCard, triggerHook } from './state.js';
/**
 * Helpers
 */
export function sourceIsSelf(context: EffectContext): boolean {
  return context.self.instanceId === context.source.instanceId;
}
export function isFriendlyTurn(context: EffectContext): boolean {
  const cardController = getCardController(context.self);
  return context.player === cardController;
}
export function isFriendly(source: CardInstance, target: CardInstance): boolean {
  return getCardController(source) === getCardController(target);
}
export function isFriendlyRow(source: CardInstance, player: PlayerRole): boolean {
  return getCardController(source) === player;
}


export const isFriendlyUnit = (source: CardInstance, target: CardInstance): boolean => {
  if (target.baseCard.category !== CardCategory.Unit) return false;
  const position = getCardPosition(target);
  if (position.zone !== Zone.RowMelee && position.zone !== Zone.RowRanged) return false;
  return isFriendly(source, target);
}
export const isEnemyUnit = (source: CardInstance, target: CardInstance): boolean => {
  if (target.baseCard.category !== CardCategory.Unit) return false;
  const position = getCardPosition(target);
  if (position.zone !== Zone.RowMelee && position.zone !== Zone.RowRanged) return false;
  return !isFriendly(source, target);
}

/**
* Effects
*/
export function canThrive(context: EffectContext): boolean {
  if (sourceIsSelf(context)) return false;
  if (!isFriendlyRow(context.source, getCardController(context.self))) return false;
  if (context.source.currentPower < context.self.currentPower) return false;
  return true;
}
const thrive1 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (canThrive(context)) {
      boostCard(context.self, 1, context.self);
      triggerHook(HookType.OnThriveTrigger, { source: context.self, trigger: context.source });
    }
  }
}
const thrive2 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (canThrive(context)) {
      boostCard(context.self, 2, context.self);
      triggerHook(HookType.OnThriveTrigger, { source: context.self, trigger: context.source });
    }
  }
}
export function triggersHarmony(card: CardInstance): boolean {
  const player = getCardController(card);
  const types = getCardTypes(card, CardTypeCategory.Race); //TODO: only look at race types
  //get all cards minus the card itself
  const friendlyCards = getPlayerCards(player).filter((_card) => _card.instanceId !== card.instanceId);
  for (let type of types) {
    let typeIsUnique = true;
    for (let card of friendlyCards) {
      if(cardIsType(card, type)) typeIsUnique = false;
    }
    if(typeIsUnique) return true;
  }
  return false;
}
const harmony1 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (!sourceIsSelf(context) && isFriendly(context.source, context.self)) {
      if (triggersHarmony(context.source)) {
        boostCard(context.self, 1, context.self);
        triggerHook(HookType.OnHarmonyTrigger, { source: context.self, trigger: context.source });
      }
    }
  }
}
const harmony2 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    if (!sourceIsSelf(context) && isFriendly(context.source, context.self)) {
      if (triggersHarmony(context.source)) {
        boostCard(context.self, 2, context.self);
        triggerHook(HookType.OnHarmonyTrigger, { source: context.self, trigger: context.source });
      }
    }
  }
}

const handleCooldown = {
  hook: HookType.OnTurnEnd,
  effect: (context: EffectContext) => {
    if (isFriendlyTurn(context)) {
      decrementCooldown(context.self);
    }
  }
}

/**
 * Predicates
 */
const zeal = {
  type: PredicateType.affectedBySummoningSickness,
  check: (context: EffectContext) => false
}
export const cardDefinitions: CardDefinition[] = [
  {
    id: 'token_cow',
    name: 'Cow',
    category: CardCategory.Unit,
    provisionCost: 0,
    basePower: 1,
    baseArmor: 0,
    types: ['Cow'],
    rarity: CardRarity.Bronze,
    description: 'Doomed.',
    isToken: true,
    isValidRow: isFriendlyRow,
    innateStatuses: [StatusType.Doomed]
  },
  {
    id: 'token_sand_soldier',
    name: 'Sand Soldier',
    category: CardCategory.Unit,
    provisionCost: 0,
    basePower: 1,
    baseArmor: 1,
    types: ['Soldier'],
    rarity: CardRarity.Bronze,
    description: 'Doomed.',
    isToken: true,
    isValidRow: isFriendlyRow,
    innateStatuses: [StatusType.Doomed]
  },
  {
    id: 'token_frog',
    name: 'Frog',
    category: CardCategory.Unit,
    provisionCost: 0,
    basePower: 1,
    baseArmor: 0,
    types: ['Frog'],
    rarity: CardRarity.Bronze,
    description: 'Doomed.',
    isToken: true,
    isValidRow: isFriendlyRow,
    innateStatuses: [StatusType.Doomed]
  },
  {
    id: 'card4',
    name: 'Card Four',
    types: ['Warrior'],
    basePower: 5,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Four',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card5',
    name: 'Card Five',
    types: ['Warrior'],
    basePower: 10,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Five',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card6',
    name: 'Card Six',
    types: ['Warrior'],
    basePower: 6,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Six',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card7',
    name: 'Card Seven',
    types: ['Warrior'],
    basePower: 5,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Seven',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card8',
    name: 'Card Eight',
    types: ['Warrior'],
    basePower: 5,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Eight',
    isValidRow: isFriendlyRow
  },
  {
    id: 'card9',
    name: 'Card Nine',
    types: ['Warrior'],
    basePower: 5,
    category: CardCategory.Unit,
    provisionCost: 5,
    description: 'Card Nine',
    isValidRow: isFriendlyRow
  },
  {
    id: 'unit_olaf_champion_of_skellige',
    name: 'Olaf, Champion of Skellige',
    category: CardCategory.Unit,
    provisionCost: 11,
    basePower: 15,
    baseArmor: 0,
    types: ['Bear'],
    rarity: CardRarity.Gold,
    colors: [CardColor.Green, CardColor.Green, CardColor.Green],
    description: '',
    artworkUrl: '/assets/cards/unit_olaf_champion_of_skellige.png',
    tags: ['Tall', 'Dominance'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
  },
  {
    id: 'card11',
    name: 'Card Eleven',
    category: CardCategory.Unit,
    provisionCost: 5,
    basePower: 5,
    baseArmor: 0,
    types: ['Warrior'],
    rarity: CardRarity.Bronze,
    description: 'Play: Deal 2 damage to an enemy unit.',
    //artworkUrl: '/assets/cards/card11.png',
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            dealDamage(context.target, 2, context.self);
          }
        },
        validTargets: isEnemyUnit
      }
    ],
    isValidRow: isFriendlyRow
  },
  {
    id: 'card12',
    name: 'Card Twelve',
    category: CardCategory.Unit,
    provisionCost: 5,
    basePower: 5,
    baseArmor: 0,
    types: ['Warrior'],
    rarity: CardRarity.Bronze,
    description: 'Turn End: Boost this by 1.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context: EffectContext) => {
          if (isFriendlyTurn(context)) {
            boostCard(context.self, 1, context.self);
          }
        }
      }
    ],
    isValidRow: isFriendlyRow
  },
  {
    id: 'unit_nekker',
    name: 'Nekker',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 1,
    baseArmor: 1,
    types: ['Monster'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Green],
    description: 'Thrive. Play: Spawn a base copy of self on this row',
    tags: ['Thrive'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
    innateStatuses: [StatusType.Locked],
    effects: [
      thrive1,
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          // Spawn a base copy of self on this row
          if (sourceIsSelf(context)) {
            spawnCard(context.self.baseCard, getCardRow(context.self), getCardRowIndex(context.self) + 1, context.self);
          }
        }
      }
    ]
  },
  {
    id: 'unit_squire',
    name: 'Squire',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 2,
    baseArmor: 0,
    types: ['Human', 'Soldier'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.White],
    description: 'Play: Boost a friendly unit by 2. If it has armor, boost it by 4 instead',
    tags: ['Armor'],
    sets: ['Base'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            if (context.target.currentArmor > 0) {
              boostCard(context.target, 4, context.self);
            } else {
              boostCard(context.target, 2, context.self);
            }
          }
        },
        validTargets: isFriendlyUnit
      }
    ]
  },
  {
    id: 'resource_barracks',
    name: 'Barracks',
    category: CardCategory.Resource,
    provisionCost: 5,
    basePower: 0,
    baseArmor: 0,
    types: ['Location'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.White],
    description: 'Whenever you play a Soldier, boost it by 1.',
    tags: ['Soldier', 'Location', 'Inspired'],
    sets: ['Base'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (!sourceIsSelf(context)) {
            if (cardIsType(context.source, 'Soldier')) {
              boostCard(context.source, 1, context.self);
            }
          }
        }
      }
    ]
  },
  {
    id: 'special_pardon',
    name: 'Pardon',
    category: CardCategory.Special,
    provisionCost: 4,
    basePower: 0,
    baseArmor: 0,
    types: ['Tactic', 'Noble'],
    rarity: CardRarity.Bronze,
    colors: [],
    description: 'Remove a unit\'s lock and boost it by 5',
    tags: ['Lock', 'Noble'],
    sets: ['Base'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            removeStatus(context.target, StatusType.Locked);
            boostCard(context.target, 5, context.self);
          }
        },
        validTargets: isFriendlyUnit,
        zone: Zone.Graveyard
      }
    ]
  },
  {
    id: 'unit_plumard',
    name: 'Plumard',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 5,
    baseArmor: 0,
    types: ['Vampire'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Black],
    description: 'Play: Give an enemy unit Decay (2). Bonded: Give an enemy unit Decay (X), where X is it\'s base power instead',
    tags: ['Decay', 'Bonded'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            if (isBonded(context.self)) {
              addStatus(context.target, StatusType.Decay, getCardBasePower(context.target));
            } else {
              addStatus(context.target, StatusType.Decay, 2);
            }
          }
        },
        validTargets: isEnemyUnit
      }
    ]
  },
  {
    id: 'unit_mortar',
    name: 'Mortar',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 5,
    baseArmor: 0,
    types: ['Vampire'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Black],
    description: 'Activate: Deal 2 damage to an enemy unit. Cooldown: 2.',
    tags: ['Decay', 'Bonded'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnAbilityActivated,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            dealDamage(context.target, 2, context.self);
            activatedAbility(context.self, 2);
          }
        },
        validTargets: isEnemyUnit
      },
      handleCooldown
    ]
  },
  {
    id: 'unit_trebuchet',
    name: 'Trebuchet',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 5,
    baseArmor: 0,
    types: ['Vampire'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Black],
    description: 'Activate: Deal 2 damage to an enemy unit',
    tags: ['Decay', 'Bonded'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnAbilityActivated,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            dealDamage(context.target, 2, context.self);
            activatedAbility(context.self);
          }
        },
        validTargets: isEnemyUnit
      }
    ],
    abilityOneTimeUse: true
  },
  {
    id: 'unit_catapult',
    name: 'Catapult',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 5,
    baseArmor: 0,
    types: ['Vampire'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Black],
    description: 'Zeal. Activate: Deal 2 damage to an enemy unit. Charges: 3.',
    tags: ['Decay', 'Bonded'],
    sets: ['Witcher'],
    isValidRow: isFriendlyRow,
    effects: [
      {
        hook: HookType.OnAbilityActivated,
        effect: (context: EffectContext) => {
          if (sourceIsSelf(context)) {
            dealDamage(context.target, 2, context.self);
            activatedAbility(context.self);
          }
        },
        validTargets: isEnemyUnit
      }
    ],
    abilityInitialCharges: 3,
    predicates: [
      zeal
    ]
  },
  {
    id: 'unit_volo_guide_to_monsters',
    name: 'Volo, Guide To Monsters',
    category: CardCategory.Unit,
    provisionCost: 7,
    basePower: 3,
    baseArmor: 0,
    types: ['Human', 'Mage'],
    rarity: CardRarity.Gold,
    colors: [CardColor.Green, CardColor.Green],
    description: 'Harmony 2.',
    tags: ['Harmony'],
    sets: ['Dungeons & Dragons'],
    isValidRow: isFriendlyRow,
    effects: [
      harmony2
    ]
  }
];