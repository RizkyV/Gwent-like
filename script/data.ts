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
  friendlyRows: Row[];
  enemyRows: Row[];
  friendlyHand: CardInstance[];
  enemyHand: CardInstance[];
  friendlyDeck: CardInstance[];
  enemyDeck: CardInstance[];
  friendlyGraveyard: CardInstance[];
  enemyGraveyard: CardInstance[];
  currentPlayer: 'friendly' | 'enemy';
  roundWins: { friendly: number; enemy: number };
  currentRound: number;
  phase: 'draw' | 'play' | 'end' | 'gameOver';
};

type RowEffect = {
  id: string;
  description?: string;
  duration?: number; // e.g., how long an effect like "frost" lasts
  apply: (state: GameState, row: Row) => Row;
};

type Row = {
  id: 'melee' | 'ranged';
  cards: CardInstance[];
  effect?: RowEffect;
};

interface CardDefinition {
  id: string;
  name: string;
  power: number;
  type: 'unit' | 'special' | 'resource';
  tags?: string[];
  onPlay?: string | GameEffect;
  isToken?: boolean;
}

interface CardInstance {
  instanceId: string; // Unique per game instance (e.g. UUID)
  baseCard: CardDefinition; // Reference to static card definition
  currentPower: number; // Modifiable in-game value
  boosted?: boolean;
  locked?: boolean;
}

type GameEffect = (state: GameState) => GameState;

const cardDefinitions: CardDefinition[] = [
  {
    id: 'card1',
    name: 'Card One',
    power: 5,
    type: 'unit',
    tags: ['warrior'],
  }
];