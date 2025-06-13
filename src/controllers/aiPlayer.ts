import { DUMMY_DELAY, MAX_ROW_SIZE } from '../core/constants.js';
import { getGameState, passTurn, playCard } from '../core/state.js';
import { PlayerController, RowType } from '../core/types.js';
/**
 * TODO: If you are in the lead, and opponent has passed, then pass
 */
export const aiPlayer: PlayerController = {
  type: 'ai',
  makeMove: async (role) => {
    console.log(`It's AI ${role}'s turn.`);
    // Wait for X seconds before making a move
    await new Promise(resolve => setTimeout(resolve, DUMMY_DELAY));
    if (getGameState().players[role].hand.length > 0) {
      console.log(`Playing card: ${getGameState().players[role].hand[0].baseCard.name}`);
      if (getGameState().players[role].rows.find((row) => row.type === RowType.Melee).cards.length >= MAX_ROW_SIZE) {
        playCard(getGameState().players[role].hand[0], role, RowType.Ranged, 0);
      } else {
        playCard(getGameState().players[role].hand[0], role, RowType.Melee, 0);
      }
    } else {
      console.log(`No cards to play, passing turn for ${role}.`);
      passTurn(role);
    }
    return;
  }
};