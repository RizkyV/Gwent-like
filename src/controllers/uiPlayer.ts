import { PlayerController, PlayerRole } from '../core/types.js';

// These will be set by the UI when the player acts
let resolveMove: (() => void) = null;

// Call this from your UI when the player completes their move (play card, target, or pass)
export function playerMadeMove() {
  console.log('Player made a move, resolving...');
  if (resolveMove) {
    resolveMove();
    resolveMove = null;
  }
}

export const uiPlayer: PlayerController = {
  type: 'human',
  makeMove: async (_role: PlayerRole) => {
    console.log(`It's your turn. Waiting for your move...`);
    // Wait for the UI to end the turn
    return await new Promise<void>(resolve => {
      resolveMove = resolve;
    });
  }
};