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

type GameState = {
  players: {
    friendly: PlayerState;
    enemy: PlayerState;
  };
  currentPlayer: 'friendly' | 'enemy';
  currentRound: number;
  phase: 'draw' | 'play' | 'end' | 'gameOver';
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
  onPlay?: GameEffect;
  isToken?: boolean;
}

interface CardInstance {
  instanceId: string; //Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; //Reference to static card definition
  currentPower: number; //Modifiable in-game value
  boosted?: boolean;
  locked?: boolean;
}

type GameEffect = (state: GameState, context: EffectContext) => GameState;

type EffectContext = {
  source: CardInstance;
  player: PlayerRole;
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

const cardDefinitions: CardDefinition[] = [
  {
    id: 'card1',
    name: 'Card One',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    onPlay: boostAllFriendlyUnits
  }
];