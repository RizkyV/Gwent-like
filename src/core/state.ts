import { CardInstance, GameState } from './types.js';

export function createInitialGameState(friendlyDeck: CardInstance[], enemyDeck: CardInstance[]): GameState {
  return {
    players: {
      friendly: {
        hand: [],
        deck: [...friendlyDeck],
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      },
      enemy: {
        hand: [],
        deck: [...enemyDeck],
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      }
    },
    currentPlayer: 'friendly',
    currentRound: 1,
    phase: 'draw',
    turn: {
      hasActivatedAbility: false,
      hasPlayedCard: false
    }
  };
}