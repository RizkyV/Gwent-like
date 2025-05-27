import { GameState, PlayerRole, GameConfig } from './types.js';
import { drawCards, triggerHook } from './logic.js';
import { flipCoin } from '../utils/utils.js';
import {
  CARDS_DRAWN_ROUND_1,
  CARDS_DRAWN_ROUND_2,
  CARDS_DRAWN_ROUND_3,
  MAX_ROUNDS
} from './constants.js';

export function startRound(state: GameState): GameState {
  let newState = state;
  let cardsToDraw = CARDS_DRAWN_ROUND_1;
  if (state.currentRound === 2) cardsToDraw = CARDS_DRAWN_ROUND_2;
  if (state.currentRound === 3) cardsToDraw = CARDS_DRAWN_ROUND_3;
  newState = drawCards(newState, 'friendly', cardsToDraw);
  newState = drawCards(newState, 'enemy', cardsToDraw);
  return {
    ...newState,
    phase: 'play',
    currentPlayer: flipCoin() ? 'friendly' : 'enemy'
  };
}

export function checkEndOfRound(state: GameState): GameState {
  const bothPassed = state.players.friendly.passed && state.players.enemy.passed;
  if (bothPassed) {
    return {
      ...state,
      phase: 'roundEnd',
    };
  }
  return state;
}

export function resetForNewRound(state: GameState): GameState {
  state.currentRound += 1;
  state.phase = 'draw';
  state.players.friendly.passed = false;
  state.players.enemy.passed = false;
  return state;
}

export function newTurn(state: GameState): GameState {
  state.turn = { hasActivatedAbility: false, hasPlayedCard: false };
  state.currentPlayer = state.currentPlayer === 'friendly' ? 'enemy' : 'friendly';
  return state;
}

export function passTurn(state: GameState, player: PlayerRole): GameState {
  const playerState = state.players[player];
  if (playerState.passed) {
    console.warn(`${player} has already passed this turn.`);
    return state;
  }
  return {
    ...state,
    players: {
      ...state.players,
      [player]: {
        ...playerState,
        passed: true
      }
    },
    turn: {
      ...state.turn,
      hasPlayedCard: true
    }
  };
}

export async function gameLoop(config: GameConfig, initialState: GameState, onStateUpdate?: (state: GameState) => void) {
  let state = initialState;
  if (onStateUpdate) onStateUpdate(state); // Initial state
  while (state.phase !== 'gameOver') {
    if (state.phase === 'draw') {
      console.log(`Starting round ${state.currentRound}`);
      state = drawCards(state, 'friendly', 3);
      state = drawCards(state, 'enemy', 3);
      state = triggerHook('onRoundStart', state, { player: 'friendly', source: null });
      state = triggerHook('onRoundStart', state, { player: 'enemy', source: null });
      state.phase = 'play';
      continue;
    }
    if (state.phase === 'play') {
      console.log(`Player ${state.currentPlayer}'s turn.`);
      const controller = config.controllers[state.currentPlayer];

      const newState = await controller.makeMove(state, state.currentPlayer);
      if (onStateUpdate) onStateUpdate(newState);
      state = newTurn(newState);

      const bothPassed = state.players.friendly.passed && state.players.enemy.passed;
      const bothHandsEmpty = state.players.friendly.hand.length === 0 && state.players.enemy.hand.length === 0;
      if (bothPassed || bothHandsEmpty) {
        state.phase = 'roundEnd';
        continue;
      }
      continue;
    }
    if (state.phase === 'roundEnd') {
      const friendlyPoints = state.players.friendly.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);
      const enemyPoints = state.players.enemy.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);

      if (friendlyPoints > enemyPoints) {
        state.players.friendly.roundWins += 1;
        console.log(`Round ${state.currentRound} goes to Friendly (${friendlyPoints} vs ${enemyPoints})`);
      } else if (enemyPoints > friendlyPoints) {
        state.players.enemy.roundWins += 1;
        console.log(`Round ${state.currentRound} goes to Enemy (${enemyPoints} vs ${friendlyPoints})`);
      } else {
        console.log(`Round ${state.currentRound} is a tie! (${friendlyPoints} vs ${enemyPoints})`);
      }

      state = triggerHook('onRoundEnd', state, { player: 'friendly', source: null });
      state = triggerHook('onRoundEnd', state, { player: 'enemy', source: null });

      state.players.friendly.rows.forEach(row => row.cards = []);
      state.players.enemy.rows.forEach(row => row.cards = []);

      const friendlyWins = state.players.friendly.roundWins;
      const enemyWins = state.players.enemy.roundWins;

      //Calculate the amount of round wins needed to win the game
      const roundsLeft = MAX_ROUNDS - state.currentRound;
      const friendlyCanBeCaught = (friendlyWins + roundsLeft) >= enemyWins;
      const enemyCanBeCaught = (enemyWins + roundsLeft) >= friendlyWins;
      const gameIsOver = !friendlyCanBeCaught || !enemyCanBeCaught || state.currentRound >= MAX_ROUNDS;

      if (gameIsOver) {
        state.phase = 'gameOver';
        const winner = friendlyWins > enemyWins ? 'Friendly' : (enemyWins > friendlyWins ? 'Enemy' : 'Draw');
        console.log(`Game Over! Winner: ${winner}`);
        break;
      }

      if (onStateUpdate) onStateUpdate(state);

      state = resetForNewRound(state);
      continue;
    }
  }
}