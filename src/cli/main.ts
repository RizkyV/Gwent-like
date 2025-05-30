import { cardDefinitions } from '../core/cards.js';
import { createCardInstance } from '../core/logic.js';
import { GameConfig } from '../core/types.js';
import { dummyPlayer } from '../controllers/dummyPlayer.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';

export const runGame = async () => {
    const friendlyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
    const enemyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
    resetGameState(friendlyDeck, enemyDeck);
    const config: GameConfig = {
        controllers: {
            friendly: dummyPlayer2,
            enemy: dummyPlayer2
        }
    }
    console.log('Game starting...');
    await gameLoop(config);
    console.log('Game finished.');
}