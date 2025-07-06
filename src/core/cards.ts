import { CardCategory, CardColor, CardDefinition, CardInstance, CardRarity, CardTypeCategory, EffectContext, EffectSource, HookType, PlayerRole, PredicateType, Row, RowEffectType, StatusType, Zone } from '../core/types.js';
import { getCardController, getCardRow, getCardRowIndex } from './helpers/board.js';
import { cardIsType, getCardBasePower, getCardTypes, isBonded } from './helpers/card.js';
import { hasRowEffect } from './helpers/row.js';
import { activatedAbility, addRowEffect, addStatus, boostCard, dealDamage, decrementCooldown, getCardPosition, getPlayerCards, getRow, removeStatus, spawnCard, triggerHook } from './state.js';

// Add this declaration to fix ImportMeta typing for Vite or similar environments
declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string;
    // add other env variables here if needed
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Helpers
 */
export function sourceIsSelf(context: EffectContext): boolean {
  const self = getEffectSourceCard(context.self);
  const source = getEffectSourceCard(context.source);
  if (!self || !source) return null;
  return self.instanceId === source.instanceId;
}
export function isFriendlyTurn(context: EffectContext): boolean {
  const self = getEffectSourceCard(context.self);
  if (!self) return null;
  const cardController = getCardController(self);
  return context.player === cardController;
}
export function isFriendly(source: CardInstance, target: CardInstance): boolean {
  return getCardController(source) === getCardController(target);
}
export function isFriendlyRow(source: CardInstance, player: PlayerRole): boolean {
  return getCardController(source) === player;
}
export function isEnemyRow(source: CardInstance, player: PlayerRole): boolean {
  return getCardController(source) !== player;
}


export const targetIsFriendlyUnit = (source: CardInstance, target: EffectSource): boolean => {
  if (target.kind !== 'card') return false;
  if (target.card.baseCard.category !== CardCategory.Unit) return false;
  const position = getCardPosition(target.card);
  if (position.zone !== Zone.RowMelee && position.zone !== Zone.RowRanged) return false;
  return isFriendly(source, target.card);
}
export const targetIsEnemyUnit = (source: CardInstance, target: EffectSource): boolean => {
  if (target.kind !== 'card') return false;
  if (target.card.baseCard.category !== CardCategory.Unit) return false;
  const position = getCardPosition(target.card);
  if (position.zone !== Zone.RowMelee && position.zone !== Zone.RowRanged) return false;
  return !isFriendly(source, target.card);
}
export function targetIsFriendlyRow(source: CardInstance, target: EffectSource): boolean {
  if (target.kind !== 'row') return false;
  return getCardController(source) === target.row.player;
}
export function targetIsEnemyRow(source: CardInstance, target: EffectSource): boolean {
  if (target.kind !== 'row') return false;
  return getCardController(source) !== target.row.player;
}

export function getEffectSourceCard(effectSource: EffectSource): CardInstance | null {
  if (effectSource.kind !== "card") return null;
  return effectSource.card;
}
export function getEffectSourceRow(effectSource: EffectSource): Row | null {
  if (effectSource.kind !== "row") return null;
  return effectSource.row;
}

/**
* Effects
*/
export function canThrive(context: EffectContext): boolean {
  const self = getEffectSourceCard(context.self);
  const source = getEffectSourceCard(context.source);
  if (!self || !source) return false;
  if (sourceIsSelf(context)) return false;
  if (!isFriendlyRow(source, getCardController(self))) return false;
  if (source.currentPower < self.currentPower) return false;
  return true;
}
const thrive1 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    const self = getEffectSourceCard(context.self);
    if (!self) return;
    if (canThrive(context)) {
      boostCard(self, 1, { kind: 'card', card: self });
      triggerHook(HookType.OnThriveTrigger, { source: context.self, trigger: context.source });
    }
  }
}
const thrive2 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    const self = getEffectSourceCard(context.self);
    if (!self) return;
    if (canThrive(context)) {
      boostCard(self, 2, { kind: 'card', card: self });
      triggerHook(HookType.OnThriveTrigger, { source: context.self, trigger: context.source });
    }
  }
}
export function triggersHarmony(card: CardInstance): boolean {
  const player = getCardController(card);
  const types = getCardTypes(card, CardTypeCategory.Race);
  //get all cards minus the card itself
  const friendlyCards = getPlayerCards(player).filter((_card) => _card.instanceId !== card.instanceId);
  for (let type of types) {
    let typeIsUnique = true;
    for (let card of friendlyCards) {
      if (cardIsType(card, type)) typeIsUnique = false;
    }
    if (typeIsUnique) return true;
  }
  return false;
}
const harmony1 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    const self = getEffectSourceCard(context.self);
    const source = getEffectSourceCard(context.source);
    if (!self || !source) return;
    if (!sourceIsSelf(context) && isFriendly(source, self)) {
      if (triggersHarmony(source)) {
        boostCard(self, 1, { kind: 'card', card: self });
        triggerHook(HookType.OnHarmonyTrigger, { source: context.self, trigger: context.source });
      }
    }
  }
}
const harmony2 = {
  hook: HookType.OnPlay,
  effect: (context: EffectContext) => {
    const self = getEffectSourceCard(context.self);
    const source = getEffectSourceCard(context.source);
    if (!self || !source) return;
    if (!sourceIsSelf(context) && isFriendly(source, self)) {
      if (triggersHarmony(source)) {
        boostCard(self, 2, { kind: 'card', card: self });
        triggerHook(HookType.OnHarmonyTrigger, { source: context.self, trigger: context.source });
      }
    }
  }
}

const handleCooldown = {
  hook: HookType.OnTurnEnd,
  effect: (context: EffectContext) => {
    const self = getEffectSourceCard(context.self);
    if (!self) return;
    if (isFriendlyTurn(context)) {
      decrementCooldown(self);
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
    name: 'cards.token_cow.name',
    category: CardCategory.Unit,
    provisionCost: 0,
    basePower: 1,
    baseArmor: 0,
    types: ['Cow'],
    rarity: CardRarity.Bronze,
    description: 'cards.token_cow.desc',
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
    name: 'cards.token_frog.name',
    category: CardCategory.Unit,
    provisionCost: 0,
    basePower: 1,
    baseArmor: 0,
    types: ['Frog'],
    rarity: CardRarity.Bronze,
    description: 'cards.token_cow.desc',
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
    name: 'cards.unit_olaf_champion_of_skellige.name',
    category: CardCategory.Unit,
    provisionCost: 11,
    basePower: 15,
    baseArmor: 0,
    types: ['Bear'],
    rarity: CardRarity.Gold,
    colors: [CardColor.Green, CardColor.Green, CardColor.Green],
    description: 'cards.unit_olaf_champion_of_skellige.desc',
    artworkUrl: import.meta.env.BASE_URL + 'assets/cards/unit_olaf_champion_of_skellige.png',
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.self);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            dealDamage(target, 2, { kind: 'card', card: self });
          }
        },
        validTargets: targetIsEnemyUnit
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
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (isFriendlyTurn(context)) {
            boostCard(self, 1, { kind: 'card', card: self });
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
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          // Spawn a base copy of self on this row
          if (sourceIsSelf(context)) {
            spawnCard(self.baseCard, getCardRow(self), getCardRowIndex(self) + 1, context.self);
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            if (target.currentArmor > 0) {
              boostCard(target, 4, context.self);
            } else {
              boostCard(target, 2, context.self);
            }
          }
        },
        validTargets: targetIsFriendlyUnit
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
          const self = getEffectSourceCard(context.self);
          const source = getEffectSourceCard(context.source);
          if (!self || !source) return;
          if (!sourceIsSelf(context)) {
            if (cardIsType(source, 'Soldier')) {
              boostCard(source, 1, context.self);
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            removeStatus(target, StatusType.Locked);
            boostCard(target, 5, context.self);
          }
        },
        validTargets: targetIsFriendlyUnit,
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            if (isBonded(self)) {
              addStatus(target, StatusType.Decay, getCardBasePower(target));
            } else {
              addStatus(target, StatusType.Decay, 2);
            }
          }
        },
        validTargets: targetIsEnemyUnit
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            dealDamage(target, 2, context.self);
            activatedAbility(self, 2);
          }
        },
        validTargets: targetIsEnemyUnit
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            dealDamage(target, 2, context.self);
            activatedAbility(self);
          }
        },
        validTargets: targetIsEnemyUnit
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
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceCard(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            dealDamage(target, 2, context.self);
            activatedAbility(self);
          }
        },
        validTargets: targetIsEnemyUnit
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
  },
  {
    id: 'unit_cantarella',
    name: 'Cantarella',
    category: CardCategory.Unit,
    provisionCost: 7,
    basePower: 1,
    baseArmor: 0,
    types: ['Human', 'Agent'],
    rarity: CardRarity.Gold,
    colors: [CardColor.Blue, CardColor.Blue],
    description: 'Disloyal. Play: Play the top card of your opponent\'s deck.',
    tags: ['Mill', 'Spying'],
    sets: ['Witcher'],
    isValidRow: isEnemyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (sourceIsSelf(context)) {
            //TODO: find top card - play it
          }
        }
      }
    ]
  },
  {
    id: 'unit_foglet',
    name: 'Foglet',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 4,
    baseArmor: 0,
    types: ['Monster'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Green],
    description: 'At the end of your turn, if there is Fog on the opposite row, boost self by 1.',
    tags: ['Fog'],
    sets: ['Witcher'],
    isValidRow: isEnemyRow,
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context: EffectContext) => {
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (isFriendlyTurn) {
            const player = getCardController(self);
            const row = getCardRow(self);
            if (hasRowEffect(getRow(player, row.type), RowEffectType.Fog)) {
              boostCard(self, 1, context.self);
            }
          }
        }
      }
    ]
  },
  {
    id: 'unit_ancient_foglet',
    name: 'Ancient Foglet',
    category: CardCategory.Unit,
    provisionCost: 4,
    basePower: 4,
    baseArmor: 0,
    types: ['Monster'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Green],
    description: 'Whenever Fog deals damage to an enemy unit, boost self by the same amount.',
    tags: ['Fog'],
    sets: ['Witcher'],
    isValidRow: isEnemyRow,
    effects: [
      {
        hook: HookType.OnDamaged,
        effect: (context: EffectContext) => {
          const self = getEffectSourceCard(context.self);
          if (!self) return;
          if (isFriendlyTurn) {
            const player = getCardController(self);
            const row = getCardRow(self);
            if (hasRowEffect(getRow(player, row.type), RowEffectType.Fog)) {
              boostCard(self, 1, context.self);
            }
          }
        }
      }
    ]
  },
  {
    id: 'special_impenetrable_fog',
    name: 'Impenetrable Fog',
    category: CardCategory.Special,
    provisionCost: 4,
    basePower: 0,
    baseArmor: 0,
    types: ['Monster'],
    rarity: CardRarity.Bronze,
    colors: [CardColor.Green],
    description: 'Spawn Fog (3) on an enemy row.',
    tags: ['Fog'],
    sets: ['Witcher'],
    isValidRow: isEnemyRow,
    effects: [
      {
        hook: HookType.OnPlay,
        effect: (context: EffectContext) => {
          const self = getEffectSourceCard(context.self);
          const target = getEffectSourceRow(context.target);
          if (!self || !target) return;
          if (sourceIsSelf(context)) {
            addRowEffect(target.player, target.type, RowEffectType.Fog, 3);
          }
        },
        validTargets: targetIsEnemyRow,
        zone: Zone.Graveyard
      }
    ]
  }
];