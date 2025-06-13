import { cardDefinitions } from '../core/cards.js';
import { CardDefinition, GameConfig } from '../core/types.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';
import { uiPlayer } from '../controllers/uiPlayer.js';
import { DEFAULT_DECK_SIZE } from '../core/constants.js';

export const runGame = async () => {
    const activeCardPool = [cardDefinitions[9], cardDefinitions[16]];
    const passiveCardPool = cardDefinitions.slice(0, 10);

    const testActiveDeck: CardDefinition[] = Array.from({ length: 10/* DEFAULT_DECK_SIZE */ }, (_, i) => activeCardPool[i % activeCardPool.length]);
    const testPassiveDeck: CardDefinition[] = Array.from({ length: DEFAULT_DECK_SIZE }, (_, i) => passiveCardPool[i % passiveCardPool.length]);

    const config: GameConfig = {
        controllers: {
            friendly: uiPlayer,
            enemy: dummyPlayer2
        }
    }
    resetGameState(testActiveDeck, testPassiveDeck, config);
    await gameLoop(config);
}