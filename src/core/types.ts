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
  hand: CardInstance[];
  deck: CardInstance[];
  graveyard: CardInstance[];
  rows: Row[];
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
  type: RowType;
  player: PlayerRole;
  cards: CardInstance[];
  effect?: RowEffect;
};

export enum RowType {
  Melee = 'melee',
  Ranged = 'ranged'
}

export interface CardDefinition {
  id: string;
  name: string;
  basePower: number;
  category: 'unit' | 'special' | 'resource';
  provisionCost: number;
  description?: string;
  artworkUrl?: string; //URL to card artwork
  color?: string; //e.g. 'blue', 'red', 'green'
  type?: string[]; //races - classes - factions
  rarity?: 'bronze' | 'gold'
  tags?: string[]; //mechanical or deck tags for filtering
  sets?: string[]; //set groupings
  isToken?: boolean;
  effects?: HookedEffect[]; //Hooks
  isValidRow: (source: CardInstance, player: PlayerRole, rowId: RowType) => boolean;
}

export interface CardInstance {
  instanceId: string; //Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; //Reference to static card definition
  owner: PlayerRole;
  currentPower: number; //Modifiable in-game value
  statuses: Set<StatusId>;
  boosted?: boolean;
}

export type GameEffect = (context: EffectContext) => void;

export interface EffectContext<Meta = EffectMetadata> {
  self?: CardInstance; //The card that the hook is being triggered on
  source?: CardInstance; //The card that triggered the effect
  target?: CardInstance; //The card that is being targeted by the effect
  player?: PlayerRole; //The current player
  metadata?: Meta;
}

type EffectMetadata =
  | { damagedCard: CardInstance; damageAmount: number }
  | { boostedCard: CardInstance; boostAmount: number }
  | { movedFrom: Zone; movedTo: Zone }
  | { abilityId: string }
  | Record<string, any>; // fallback

export type StatusId = 'locked' | 'poisoned' | 'veil' | string;

export type StatusEffect = {
  id: StatusId;
  description: string;
  effects?: HookedEffect[]; //Hooks
    // For example, a predicate to check if card can be targeted
  canBeTargeted?: (card: CardInstance, state: GameState) => boolean;
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
  OnAbilityActivated = 'onAbilityActivated'
}

export type HookedEffect = {
  hook: HookType;
  effect: GameEffect;
  validTargets?: (source: CardInstance, target: CardInstance) => boolean; // Optional function to validate targets
};