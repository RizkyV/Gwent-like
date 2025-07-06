import { cardDefinitions, getCardDefinition } from '../core/cards.js';
import { CardDefinition, GameConfig } from '../core/types.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';
import { uiPlayer } from '../controllers/uiPlayer.js';
import { DEFAULT_DECK_SIZE } from '../core/constants.js';
import { TypeCategoryMap } from '../core/helpers/card.js';

export const runGame = async () => {
    const types = cardDefinitions.flatMap(c => c.types);
    const typesMissingCat = types.filter(t => !TypeCategoryMap[t]);
    typesMissingCat ?? console.warn('Types still missing a category!', typesMissingCat);

    const activeCardPool = [getCardDefinition('unit_olaf_champion_of_skellige'), getCardDefinition('unit_nekker'), getCardDefinition('unit_plumard'), getCardDefinition('unit_catapult')];
    const passiveCardPool = cardDefinitions.slice(0, 10);

    const testActiveDeck: CardDefinition[] = Array.from({ length: DEFAULT_DECK_SIZE }, (_, i) => activeCardPool[i % activeCardPool.length]);
    const testPassiveDeck: CardDefinition[] = Array.from({ length: DEFAULT_DECK_SIZE }, (_, i) => passiveCardPool[i % passiveCardPool.length]);

    const config: GameConfig = {
        controllers: {
            ivory: uiPlayer,
            obsidian: dummyPlayer2
        }
    }
    resetGameState(testActiveDeck, testPassiveDeck, config);
    await gameLoop(config);
}