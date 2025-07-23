// === ENUMS & BASIC TYPES ===
export enum PlayerRole { Ivory = 'ivory', Obsidian = 'obsidian' }
export enum GamePhase { Draw = 'draw', Mulligan = 'mulligan', Play = 'play', RoundEnd = 'roundEnd', GameOver = 'gameOver' }
export enum Zone { Deck = 'deck', Hand = 'hand', Graveyard = 'graveyard', RowMelee = 'melee', RowRanged = 'ranged', Exile = 'exile' }
export enum RowType { Melee = 'melee', Ranged = 'ranged' }
export enum CardCategory { Unit = 'unit', Special = 'special', Resource = 'resource' }
export enum CardRarity { Bronze = 'bronze', Gold = 'gold' }
export enum CardColor { White = 'W', Blue = 'U', Black = 'B', Red = 'R', Green = 'G' }
export enum CardTypeCategory { Race = 'race', Class = 'class', Faction = 'faction' }
export enum StatusType {
  Decay = 'decay',
  Vitality = 'vitality',
  Locked = 'locked',
  Poisoned = 'poisoned',
  Veil = 'veil',
  Shield = 'shield',
  Doomed = 'doomed',
}
export enum RowEffectType {
  Rain = 'rain',
  Storm = 'storm',
  Frost = 'frost',
  Fog = 'fog',
  ClearSkies = 'clearSkies',
}
export enum HookType {
  OnPlay = 'onPlay',
  OnSummoned = 'onSummoned',
  OnTurnStart = 'onTurnStart',
  OnTurnEnd = 'onTurnEnd',
  OnTurnPass = 'onTurnPass',
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
    ivory: PlayerController;
    obsidian: PlayerController;
  };
  id: string; // Unique game ID
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
    ivory: PlayerState;
    obsidian: PlayerState;
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
  type: RowEffectType;
  name?: string;
  description?: string;
  effects?: HookedEffect[];
  predicates?: Predicate[];
  duration?: number;
};
export type Row = {
  cards: CardInstance[];
  type: RowType;
  player: PlayerRole;
  effects?: RowEffect[];
};

// === CARD & STATUS ===
export interface CardInstance {
  instanceId: string; //Unique ID per game instance
  baseCard: CardDefinition; //Reference to static card definition
  owner: PlayerRole;
  controller?: PlayerRole; //The player that controls the card currently (set by the UI)
  currentPower: number;
  currentArmor?: number;
  currentBasePower?: number; //Base power can change due to effects
  statuses: Map<StatusType, CardStatus>;
  enteredTurn?: number;
  abilityUsed: boolean;
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
  types?: string[]; //races - classes - factions (creeds)
  rarity?: CardRarity;
  colors?: CardColor[];
  description?: string;
  flavorText?: string;
  artworkUrl?: string;
  tags?: string[];
  sets?: string[];
  isToken?: boolean;
  isValidRow: (self: CardInstance, player: PlayerRole, rowType: RowType) => boolean;
  innateStatuses?: StatusType[];
  effects?: HookedEffect[];
  abilityOneTimeUse?: boolean;
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
  validTargets?: (source: EffectSource, target: EffectSource) => boolean;
  zone?: Zone | ((context: EffectContext) => boolean);
};
export type Predicate = {
  type: PredicateType;
  check: (context: EffectContext) => boolean;
  layer?: string; //5 layers of predicates. 1 - Card, 2 - Adjacency, 3 - Row (self exclusive), 4 - Player, 5 - Global  (if its self + adjacent, then make to predicates - one with 1 and one with 2)
  // instead of layers just write a function that determines whether the target/source is affected by the predicate
  // a predicate that just effects itself should check sourceIsSelf()
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
export type EffectSource =
  | { kind: "card"; card: CardInstance }
  | { kind: "status"; status: StatusType; card: CardInstance }
  | { kind: "row"; row: Row }
  | { kind: "rowEffect"; type: RowEffectType; row: Row }
  // Add more as needed

export interface EffectContext {
  self?: EffectSource;
  source?: EffectSource;
  target?: EffectSource;
  trigger?: EffectSource; //the card that triggered the effect on the source card (ie. an Elf triggering a Dwarf with Harmony - Elf would be trigger - Dwarf would be source)
  player?: PlayerRole;
  amount?: number; //The relevant amount (ie. damage amount, boost amount etc.)
  metadata?: EffectMetadata;
}

type EffectMetadata =
  | { movedFrom: Zone; movedTo: Zone }
  | Record<string, any>; // fallback

// === STATE ===
export type CardPosition = {
  card: CardInstance;
  player: PlayerRole;
  zone: Zone;
  rowType?: RowType;
  index?: number;
}