import { GameConfig, GamePhase } from './types.js';
import {
  MAX_ROUNDS
} from './constants.js';
import { checkEndOfRound, endRound, endTurn, getGameState, mulliganCards, setToPhase, startRound, startTurn } from './state.js';

export async function gameLoop(config: GameConfig) {
  console.log('Game starting...');
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
      console.log(`Player ${getGameState().currentPlayer} has made their move.`);

      const roundOver = checkEndOfRound();
      if (roundOver) {
        setToPhase(GamePhase.RoundEnd);
      }

      endTurn();
    }
    if (getGameState().phase === GamePhase.RoundEnd) {
      endRound();
      const ivoryWins = getGameState().players.ivory.roundWins;
      const obsidianWins = getGameState().players.obsidian.roundWins;

      //Calculate the amount of round wins needed to win the game
      const roundsLeft = MAX_ROUNDS - getGameState().currentRound;
      const ivoryCanBeCaught = (ivoryWins + roundsLeft) >= obsidianWins;
      const obsidianCanBeCaught = (obsidianWins + roundsLeft) >= ivoryWins;
      const gameIsOver = !ivoryCanBeCaught || !obsidianCanBeCaught || getGameState().currentRound >= MAX_ROUNDS || ivoryWins + obsidianWins >= MAX_ROUNDS;
      console.log(`Round ${getGameState().currentRound} ended. Ivory Wins: ${ivoryWins}, Obsidian Wins: ${obsidianWins}`);
      console.log(`Rounds left: ${roundsLeft}. Game Over: ${gameIsOver}`);
      if (gameIsOver) {
        setToPhase(GamePhase.GameOver);
        const winner = ivoryWins > obsidianWins ? 'ivory' : (obsidianWins > ivoryWins ? 'obsidian' : 'Draw');
        console.log(`Game Over! Winner: ${winner}`);
        break;
      } else {
        setToPhase(GamePhase.Draw);
      }
    }
  }
}