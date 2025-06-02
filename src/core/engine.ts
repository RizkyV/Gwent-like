import { GameState, GameConfig, GamePhase } from './types.js';
import {
  MAX_ROUNDS
} from './constants.js';
import { checkEndOfRound, endRound, endTurn, getGameState, mulliganCards, setToPhase, startRound, startTurn } from './state.js';
//TODO: MOVE TO state.ts
export function resetForNewRound(state: GameState): GameState {
  state.currentRound += 1;
  state.phase = GamePhase.Draw;
  state.players.friendly.passed = false;
  state.players.enemy.passed = false;
  return state;
}

export async function gameLoop(config: GameConfig) {
  /**
   * Start: Round 1 - Draw Phase
   * startRound() - draws cards for both players
   * nextPhase() - sets phase to Mulligan
   * mulligan() - allows players to mulligan cards
   * nextPhase() - sets phase to Play
   * makeMove() - wait for UI input from player
   * checkEndOfRound() - checks if both players passed - or if both hands are empty
   * nextPhase() - sets phase to RoundEnd
   * endRound() - calculates round winner, updates round wins - cleans up state for next round
   * startRound() - ↻ loops back to the start of the next round
   */

  while (getGameState().phase !== GamePhase.GameOver) {
    if (getGameState().phase === GamePhase.Draw) {
      // Reset the turn state for the new round
      startRound();
    }
    if (getGameState().phase === GamePhase.Mulligan) {
      // Mulligan phase
      mulliganCards();
    }
    if (getGameState().phase === GamePhase.Play) {
      startTurn();

      // Players make moves
      console.log(`Player ${getGameState().currentPlayer}'s turn.`);
      const controller = config.controllers[getGameState().currentPlayer];
      await controller.makeMove(getGameState().currentPlayer);

      const roundOver = checkEndOfRound();
      if (roundOver) {
        setToPhase(GamePhase.RoundEnd);
      }

      endTurn();
    }
    if (getGameState().phase === GamePhase.RoundEnd) {
      endRound();
      const friendlyWins = getGameState().players.friendly.roundWins;
      const enemyWins = getGameState().players.enemy.roundWins;

      //Calculate the amount of round wins needed to win the game
      const roundsLeft = MAX_ROUNDS - getGameState().currentRound;
      const friendlyCanBeCaught = (friendlyWins + roundsLeft) >= enemyWins;
      const enemyCanBeCaught = (enemyWins + roundsLeft) >= friendlyWins;
      const gameIsOver = !friendlyCanBeCaught || !enemyCanBeCaught || getGameState().currentRound >= MAX_ROUNDS || friendlyWins + enemyWins >= MAX_ROUNDS;
      console.log(`Round ${getGameState().currentRound} ended. Friendly Wins: ${friendlyWins}, Enemy Wins: ${enemyWins}`);
      console.log(`Rounds left: ${roundsLeft}. Game Over: ${gameIsOver}`);
      if (gameIsOver) {
        setToPhase(GamePhase.GameOver);
        const winner = friendlyWins > enemyWins ? 'Friendly' : (enemyWins > friendlyWins ? 'Enemy' : 'Draw');
        console.log(`Game Over! Winner: ${winner}`);
        break;
      } else {
        setToPhase(GamePhase.Draw);
      }
    }
  }
}