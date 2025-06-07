export type PlayerRole = 'friendly' | 'enemy';

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

export type GameState = {
  players: {
    friendly: PlayerState;
    enemy: PlayerState;
  };
  currentPlayer: 'friendly' | 'enemy';
  currentRound: number;
  phase: GamePhase;
  turn: TurnState;
  GameConfig: GameConfig;
};

export enum GamePhase {
  Draw = 'draw',
  Mulligan = 'mulligan',
  Play = 'play',
  RoundEnd = 'roundEnd',
  GameOver = 'gameOver'
}

export enum Zone {
  Deck = 'deck',
  Hand = 'hand',
  Graveyard = 'graveyard',
  RowMelee = 'melee',
  RowRanged = 'ranged',
  Exile = 'exile',
}

export type PlayerState = {
  rows: Row[];
  hand: CardInstance[];
  deck: CardInstance[];
  graveyard: CardInstance[];
  //Leader Ability
  passed: boolean;
  roundWins: number;
};

export type RowEffect = {
  id: string;
  description?: string;
  duration?: number; //how long an effect like "frost" lasts
  apply: (state: GameState, row: Row) => Row;
  trigger: 'endOfTurn' | 'startOfTurn';
};

export type Row = {
  cards: CardInstance[];
  type: RowType;
  player: PlayerRole;
  effect?: RowEffect;
};

export enum RowType {
  Melee = 'melee',
  Ranged = 'ranged'
}

export enum CardCategory {
  Unit = 'unit',
  Special = 'special',
  Resource = 'resource',
}

export enum CardRarity {
  Bronze = 'bronze',
  Gold = 'gold',
}
export enum CardColor {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
}
export interface CardDefinition {
  id: string;
  name: string;
  category: CardCategory;
  provisionCost: number;
  basePower: number;
  baseArmor?: number;
  type?: string[]; //races - classes - factions
  rarity?: CardRarity
  colors?: CardColor[];
  description?: string;
  flavorText?: string;
  artworkUrl?: string; //URL to card artwork
  tags?: string[]; //mechanical or deck tags for filtering
  sets?: string[]; //set groupings
  isToken?: boolean;
  isValidRow: (source: CardInstance, player: PlayerRole, rowId: RowType) => boolean;
  innateStatuses?: StatusType[];
  effects?: HookedEffect[]; //Hooks
  predicates?: Predicate[]; //Predicates
}

export interface CardInstance {
  instanceId: string; //Unique ID per game instance
  baseCard: CardDefinition; //Reference to static card definition
  owner: PlayerRole;
  currentPower: number; //Modifiable in-game value
  currentArmor?: number;
  currentBasePower?: number; //Base power can change due to effects
  statuses: Set<StatusType>;
}

export type HookedEffect = {
  hook: HookType;
  effect: GameEffect;
  validTargets?: (source: CardInstance, target: CardInstance) => boolean; // Optional function to validate targets
};

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
}

export type GameEffect = (context: EffectContext) => void;

export interface EffectContext {
  self?: CardInstance; //The card that the hook is being triggered on
  source?: CardInstance; //The card that triggered the effect
  target?: CardInstance; //The card that is being targeted by the effect
  player?: PlayerRole; //The relevant player (ie. the one whos turn has started/ended)
  metadata?: EffectMetadata;
}

type EffectMetadata =
  | { damagedCard: CardInstance; damageAmount: number }
  | { boostedCard: CardInstance; boostAmount: number }
  | { movedFrom: Zone; movedTo: Zone }
  | { abilityId: string }
  | Record<string, any>; // fallback

export enum PredicateType {
  canBeTargeted = 'canBeTargeted',
  canBeDamaged = 'canBeDamaged',
}
export type Predicate = {
  type: PredicateType;
  check: (context: EffectContext) => boolean;
};
export enum StatusType {
  Locked = 'locked',
  Poisoned = 'poisoned',
  Veil = 'veil',
  Shield = 'shield',
  Doomed = 'doomed',
  //add more as needed
}

export type StatusEffect = {
  type: StatusType;
  description: string;
  effects?: HookedEffect[]; //Hooks
  predicates?: Predicate; // Optional predicates for additional logic
};