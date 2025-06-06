import { DUMMY_DELAY } from '../core/constants.js';
import { getGameState, passTurn } from '../core/state.js';
import { PlayerController } from '../core/types.js';

export const dummyPlayer: PlayerController = {
  type: 'scripted',
  makeMove: async (role) => {
    console.log(`It's ${role}'s turn.`);
    console.log('Hand: ', getGameState().players[role].hand.map(c => c.baseCard.name));
    console.log('Rows: ', getGameState().players[role].rows.map(r => ({
      id: r.type,
      cards: r.cards.map(c => c.baseCard.name)
    })));
    // Wait for 5 seconds before making a move
    await new Promise(resolve => setTimeout(resolve, DUMMY_DELAY));
    passTurn(role);
    return;
  }
};