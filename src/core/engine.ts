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

      const roundOver = checkEndOfRound();
      if (roundOver) {
        setToPhase(GamePhase.RoundEnd);
      }

      endTurn();
    }
    if (getGameState().phase === GamePhase.RoundEnd) {
      endRound();
      const whiteWins = getGameState().players.white.roundWins;
      const blackWins = getGameState().players.black.roundWins;

      //Calculate the amount of round wins needed to win the game
      const roundsLeft = MAX_ROUNDS - getGameState().currentRound;
      const whiteCanBeCaught = (whiteWins + roundsLeft) >= blackWins;
      const blackCanBeCaught = (blackWins + roundsLeft) >= whiteWins;
      const gameIsOver = !whiteCanBeCaught || !blackCanBeCaught || getGameState().currentRound >= MAX_ROUNDS || whiteWins + blackWins >= MAX_ROUNDS;
      console.log(`Round ${getGameState().currentRound} ended. White Wins: ${whiteWins}, Black Wins: ${blackWins}`);
      console.log(`Rounds left: ${roundsLeft}. Game Over: ${gameIsOver}`);
      if (gameIsOver) {
        setToPhase(GamePhase.GameOver);
        const winner = whiteWins > blackWins ? 'white' : (blackWins > whiteWins ? 'black' : 'Draw');
        console.log(`Game Over! Winner: ${winner}`);
        break;
      } else {
        setToPhase(GamePhase.Draw);
      }
    }
  }
}