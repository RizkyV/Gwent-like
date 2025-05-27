import { PlayerController } from '../core/types.js';
import { passTurn } from '../core/engine.js';

export const dummyPlayer: PlayerController = {
  type: 'human',
  makeMove: async (state, role) => {
    console.log(`It's ${role}'s turn.`);
    console.log('Hand: ', state.players[role].hand.map(c => c.baseCard.name));
    console.log('Rows: ', state.players[role].rows.map(r => ({
      id: r.id,
      cards: r.cards.map(c => c.baseCard.name)
    })));
    // Wait for 5 seconds before making a move
    await new Promise(resolve => setTimeout(resolve, 5000));
    return passTurn(state, role);
  }
};