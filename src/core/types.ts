// === ENUMS & BASIC TYPES ===
export enum PlayerRole { Friendly = 'friendly', Enemy = 'enemy' }
export enum GamePhase { Draw = 'draw', Mulligan = 'mulligan', Play = 'play', RoundEnd = 'roundEnd', GameOver = 'gameOver' }
export enum Zone { Deck = 'deck', Hand = 'hand', Graveyard = 'graveyard', RowMelee = 'melee', RowRanged = 'ranged', Exile = 'exile' }
export enum RowType { Melee = 'melee', Ranged = 'ranged' }
export enum CardCategory { Unit = 'unit', Special = 'special', Resource = 'resource' }
export enum CardRarity { Bronze = 'bronze', Gold = 'gold' }
export enum CardColor { White = 'W', Blue = 'U', Black = 'B', Red = 'R', Green = 'G' }
export enum StatusType {
  Decay = 'decay',
  Vitality = 'vitality',
  Locked = 'locked',
  Poisoned = 'poisoned',
  Veil = 'veil',
  Shield = 'shield',
  Doomed = 'doomed',
  //add more as needed
}
export enum HookType {
  OnPlay = 'onPlay',
  OnSummoned = 'onSummoned',
  OnTurnStart = 'onTurnStart',
  OnTurnEnd = 'onTurnEnd',
  OnRoundStart = 'onRoundStart',
  OnRoundEnd = 'onRoundEnd',
  OnTargeted = 'onTargeted',
  OnDamaged = 'onDamaged',
  OnBoosted = 'onBoosted',
  OnDeath = 'onDeath',
  OnDraw = 'onDraw',
  OnDiscard = 'onDiscard',
  OnMoved = 'onMoved',
  OnAbilityActivated = 'onAbilityActivated',

  //Keyword hooks
  OnDemiseTrigger = 'onDemiseTrigger',
  OnThriveTrigger = 'onThriveTrigger',
  OnExposedTrigger = 'onExposedTrigger',
  OnHarmonyTrigger = 'onHarmonyTrigger'
}
export enum PredicateType {
  canBeTargeted = 'canBeTargeted',
  canBeDamaged = 'canBeDamaged',
  affectedBySummoningSickness = 'affectedBySummoningSickness'
}

// === PLAYER & GAME STATE ===
export type PlayerController = {
  type: 'human' | 'ai' | 'scripted';
  makeMove: (role: PlayerRole) => Promise<void>;
};
export type GameConfig = {
  controllers: {
    friendly: PlayerController;
    enemy: PlayerController;
  };
};
export type TurnState = {
  hasPlayedCard: boolean;
  hasActivatedAbility: boolean;
};
export type PlayerState = {
  rows: Row[];
  hand: CardInstance[];
  deck: CardInstance[];
  graveyard: CardInstance[];
  passed: boolean;
  roundWins: number;
};
export type GameState = {
  players: {
    friendly: PlayerState;
    enemy: PlayerState;
  };
  currentPlayer: PlayerRole;
  currentRound: number;
  phase: GamePhase;
  turn: TurnState;
  currentTurn: number;
  GameConfig: GameConfig;
};

// === ROWS ===
export type RowEffect = {
  id: string;
  description?: string;
  duration?: number;
  apply: (state: GameState, row: Row) => Row;
  trigger: 'endOfTurn' | 'startOfTurn';
};
export type Row = {
  cards: CardInstance[];
  type: RowType;
  player: PlayerRole;
  effect?: RowEffect;
};

// === CARD & STATUS ===
export interface CardInstance {
  instanceId: string; //Unique ID per game instance
  baseCard: CardDefinition; //Reference to static card definition
  owner: PlayerRole;
  currentPower: number; //Modifiable in-game value
  currentArmor?: number;
  currentBasePower?: number; //Base power can change due to effects
  statuses: Map<StatusType, CardStatus>;
  enteredTurn?: number;
  abilityCooldown: number;
  abilityCharges: number;
  abilityCounter: number;
}
export interface CardDefinition {
  id: string;
  name: string;
  category: CardCategory;
  provisionCost: number;
  basePower: number;
  baseArmor?: number;
  types?: string[]; //races - classes - factions
  rarity?: CardRarity;
  colors?: CardColor[];
  description?: string;
  flavorText?: string;
  artworkUrl?: string;
  tags?: string[];
  sets?: string[];
  isToken?: boolean;
  isValidRow: (source: CardInstance, player: PlayerRole, rowId: RowType) => boolean;
  innateStatuses?: StatusType[];
  effects?: HookedEffect[];
  abilityInitialCharges?: number;
  abilityMaxCounter?: number;
  predicates?: Predicate[];
}
export interface CardStatus {
  type: StatusType;
  duration?: number; // undefined means permanent
}

// === EFFECTS, HOOKS, PREDICATES ===
export type GameEffect = (context: EffectContext) => void;
export type HookedEffect = {
  hook: HookType;
  effect: GameEffect;
  validTargets?: (source: CardInstance, target: CardInstance) => boolean;
  zone?: Zone | ((context: EffectContext) => boolean);
};
export type Predicate = {
  type: PredicateType;
  check: (context: EffectContext) => boolean;
};
export type StatusEffect = {
  type: StatusType;
  description: string;
  effects?: HookedEffect[];
  predicates?: Predicate;
};
export type Enchantment = {
  effect: HookedEffect;
  duration: number;
};

// === EFFECT CONTEXT & METADATA ===
export interface EffectContext {
  self?: CardInstance;
  source?: CardInstance;
  target?: CardInstance;
  trigger?: CardInstance; //the card that triggered the effect on the source card (ie. an Elf triggering a Dwarf with Harmony - Elf would be trigger - Dwarf would be source)
  player?: PlayerRole;
  metadata?: EffectMetadata;
}
type EffectMetadata =
  | { damagedCard: CardInstance; damageAmount: number }
  | { boostedCard: CardInstance; boostAmount: number }
  | { movedFrom: Zone; movedTo: Zone }
  | { abilityId: string }
  | Record<string, any>; // fallback