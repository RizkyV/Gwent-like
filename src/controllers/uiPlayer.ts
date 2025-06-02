import { PlayerController, PlayerRole } from '../core/types.js';

// These will be set by the UI when the player acts
let resolveMove: (() => void) = null;

// Call this from your UI when the player completes their move (play card, target, or pass)
export function playerEndTurn() {
  if (resolveMove) {
    resolveMove();
    resolveMove = null;
  }
}

export const uiPlayer: PlayerController = {
  type: 'human',
  makeMove: async (_role: PlayerRole) => {
    console.log(`It's your turn. Waiting for your move...`);
    // Wait for the UI to call uiPlayerMove with the new state
    return await new Promise<void>(resolve => {
      resolveMove = resolve;
    });
  }
};