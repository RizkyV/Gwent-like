import { cardDefinitions } from '../core/cards.js';
import { createCardInstance } from '../core/logic.js';
import { GameConfig } from '../core/types.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';
import { uiPlayer } from '../controllers/uiPlayer.js';

export const runGame = async () => {
    const friendlyDeck = Array.from({ length: 25 }, () => createCardInstance(cardDefinitions[10]));
    const enemyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
    const config: GameConfig = {
        controllers: {
            friendly: uiPlayer,
            enemy: dummyPlayer2
        }
    }
    resetGameState(friendlyDeck, enemyDeck, config);
    console.log('Game starting...');
    await gameLoop(config);
    console.log('Game finished.');
}