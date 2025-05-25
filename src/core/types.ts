export type PlayerRole = 'friendly' | 'enemy';

export type PlayerController = {
  type: 'human' | 'ai' | 'scripted';
  makeMove: (state: GameState, role: PlayerRole) => Promise<GameState>;
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
  phase: 'draw' | 'mulligan' | 'play' | 'roundEnd' | 'gameOver';
  turn: TurnState;
};

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
  type?: string[]; //races - classes - factions
  rarity?: 'bronze' | 'gold'
  tags?: string[]; //mechanical or deck tags for filtering
  isToken?: boolean;
  effects?: HookedEffect[]; //Hooks
}

export interface CardInstance {
  instanceId: string; //Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; //Reference to static card definition
  currentPower: number; //Modifiable in-game value
  statuses: Set<StatusId>;
  boosted?: boolean; //certain cached f
}

export type GameEffect = (state: GameState, context: EffectContext) => GameState;

export type EffectContext = {
  source: CardInstance;
  player: PlayerRole;
  metadata?: Record<string, any>; // Hook-specific data (e.g., damagedCard)
};

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
  | 'onAttack'
  | 'onDamaged'
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
};