type PlayerRole = 'friendly' | 'enemy';

type PlayerController = {
  type: 'human' | 'ai' | 'scripted';
  makeMove: (state: GameState, role: PlayerRole) => Promise<GameState>;
};

type GameConfig = {
  controllers: {
    friendly: PlayerController;
    enemy: PlayerController;
  };
};

type TurnState = {
  hasPlayedCard: boolean;
  hasActivatedAbility: boolean;
};

type GameState = {
  players: {
    friendly: PlayerState;
    enemy: PlayerState;
  };
  currentPlayer: 'friendly' | 'enemy';
  currentRound: number;
  phase: 'draw' | 'mulligan' | 'play' | 'roundEnd' | 'gameOver';
  turn: TurnState;
};

type PlayerState = {
  hand: CardInstance[];
  deck: CardInstance[];
  graveyard: CardInstance[];
  rows: Row[];
  passed: boolean;
  roundWins: number;
};

type RowEffect = {
  id: string;
  description?: string;
  duration?: number; //how long an effect like "frost" lasts
  apply: (state: GameState, row: Row) => Row;
  trigger: 'endOfTurn' | 'startOfTurn';
};

type Row = {
  id: 'melee' | 'ranged';
  cards: CardInstance[];
  effect?: RowEffect;
};

interface CardDefinition {
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

interface CardInstance {
  instanceId: string; //Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; //Reference to static card definition
  currentPower: number; //Modifiable in-game value
  statuses: Set<StatusId>;
  boosted?: boolean; //certain cached f
}

type GameEffect = (state: GameState, context: EffectContext) => GameState;

type EffectContext = {
  source: CardInstance;
  player: PlayerRole;
  metadata?: Record<string, any>; // Hook-specific data (e.g., damagedCard)
};

type StatusId = 'locked' | 'poisoned' | 'veil' | string;

type StatusEffect = {
  id: StatusId;
  description: string;
  // For example, a predicate to check if card can be targeted
  canBeTargeted?: (card: CardInstance, state: GameState) => boolean;
  // You can add hooks for onTurnStart, onDamageTaken, etc.
};

type HookType =
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

type HookedEffect = {
  hook: HookType;
  effect: GameEffect;
};


const boostAllFriendlyUnits: GameEffect = (state, context) => {
  const rows = getRows(state, context.player);

  const boostedRows = rows.map(row => ({
    ...row,
    cards: row.cards.map(card => ({
      ...card,
      currentPower: card.currentPower + 1
    }))
  }));
  return setRows(state, context.player, boostedRows);
};

const boostSelfOnEnemyDamaged: GameEffect = (state, context) => {
  const { source } = context;
  const damagedCard = context.metadata?.damagedCard;
  if (!damagedCard) return state;

  const sourceOwner = getCardOwner(state, source);
  const damagedOwner = getCardOwner(state, damagedCard);

  // Only trigger if the damaged card is on the opposing team
  if (sourceOwner === damagedOwner) return state;

  return updateCardInState(state, source.instanceId, card => ({
    ...card,
    currentPower: card.currentPower + 1
  }));
};

const cardDefinitions: CardDefinition[] = [
  {
    id: 'card1',
    name: 'Card One',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    effects: [
      {
        hook: 'onPlay',
        effect: boostAllFriendlyUnits
      }
    ]
  },
  {
    id: 'card2',
    name: 'Card Two',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    effects: [
      {
        hook: 'onDamaged',
        effect: boostSelfOnEnemyDamaged
      }
    ]
  }
];

const statusEffects: Record<StatusId, StatusEffect> = {
  locked: {
    id: 'locked',
    description: 'Card cannot be moved or acted upon',
  },
  veil: {
    id: 'veil',
    description: 'Card cannot be targeted by enemy effects',
    canBeTargeted: (card, state) => false,
  },
  poisoned: {
    id: 'poisoned',
    description: 'Card loses 1 power each turn',
    // You could add onTurnStart hooks here for ticking damage
  },
};