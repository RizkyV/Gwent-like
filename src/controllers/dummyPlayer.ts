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
    return passTurn(state, role);
  }
};