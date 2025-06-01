import { getGameState, passTurn, playCard } from '../core/state.js';
import { PlayerController } from '../core/types.js';

export const dummyPlayer2: PlayerController = {
  type: 'scripted',
  makeMove: async (role) => {
    console.log(`It's ${role}'s turn.`);
    console.log('Hand: ', getGameState().players[role].hand.map(c => c.baseCard.name));
    console.log('Rows: ', getGameState().players[role].rows.map(r => ({
      id: r.id,
      cards: r.cards.map(c => c.baseCard.name)
    })));
    // Wait for 5 seconds before making a move
    await new Promise(resolve => setTimeout(resolve, 5000));
    if (getGameState().players[role].hand.length > 0) {
      console.log(`Playing card: ${getGameState().players[role].hand[0].baseCard.name}`);
      playCard(getGameState().players[role].hand[0], role);
    } else {
      console.log(`No cards to play, passing turn for ${role}.`);
      passTurn(role);
    }
    return getGameState();
  }
};