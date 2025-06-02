import { cardDefinitions } from '../core/cards.js';
import { GameConfig } from '../core/types.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';
import { uiPlayer } from '../controllers/uiPlayer.js';

export const runGame = async () => {
    const testActiveDeck = [cardDefinitions[10], cardDefinitions[11]];
    const testPassiveDeck = cardDefinitions.slice(0, 10);
    const config: GameConfig = {
        controllers: {
            friendly: uiPlayer,
            enemy: dummyPlayer2
        }
    }
    resetGameState(testActiveDeck, testPassiveDeck, config);
    console.log('Game starting...');
    await gameLoop(config);
    console.log('Game finished.');
}