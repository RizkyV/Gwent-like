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
  id: 'melee' | 'ranged';
  cards: CardInstance[];
  effect?: RowEffect;
};

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
  isToken?: boolean;
  requiresTarget?: boolean; //Does the card require a target to play? (TODO: rework into a isValidTarget function)
  effects?: HookedEffect[]; //Hooks
}

export interface CardInstance {
  instanceId: string; //Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; //Reference to static card definition
  currentPower: number; //Modifiable in-game value
  statuses: Set<StatusId>;
  boosted?: boolean; //certain cached f
}

export type GameEffect = (context: EffectContext) => void;

export interface EffectContext<Meta = EffectMetadata> {
  self?: CardInstance; // The card that the hook is being triggered on
  source?: CardInstance;
  player?: PlayerRole;
  target?: CardInstance;
  row?: Row;
  gameState?: GameState;
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
  // For example, a predicate to check if card can be targeted
  canBeTargeted?: (card: CardInstance, state: GameState) => boolean;
  // You can add hooks for onTurnStart, onDamageTaken, etc.
};

export type HookType =
  | 'onPlay'
  | 'onTargeted'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'onDamaged'
  | 'onBoosted'
  | 'onDeath'
  | 'onSummoned'
  | 'onDraw'
  | 'onDiscard'
  | 'onGraveyardEnter'
  | 'onMoveToRow'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onAbilityActivated';

export type HookedEffect = {
  hook: HookType;
  effect: GameEffect;
  validTargets?: (source: CardInstance, target: CardInstance) => boolean; // Optional function to validate targets
};