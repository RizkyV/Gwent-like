import { cardDefinitions } from '../core/cards.js';
import { createCardInstance } from '../core/logic.js';
import { createInitialGameState } from '../core/state.js';
import { GameConfig } from '../core/types.js';
import { dummyPlayer } from '../controllers/dummyPlayer.js';
import { gameLoop } from '../core/engine.js';

export const runGame = async () => {
    console.log('Starting game...');
    const friendlyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
    const enemyDeck = cardDefinitions.slice(10, 20).map(createCardInstance);
    const state = createInitialGameState(friendlyDeck, enemyDeck);
    const config: GameConfig = {
        controllers: {
            friendly: dummyPlayer,
            enemy: dummyPlayer
        }
    }
    console.log('Game starting...');
    await gameLoop(config, state);
    console.log('Game finished.');
}