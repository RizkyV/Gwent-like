import { cardDefinitions, getCardDefinition, getLeaderDefinition } from '../core/cards.js';
import { CardDefinition, GameConfig, GameDeck } from '../core/types.js';
import { gameLoop } from '../core/engine.js';
import { resetGameState } from '../core/state.js';
import { dummyPlayer2 } from '../controllers/dummyPlayer2.js';
import { uiPlayer } from '../controllers/uiPlayer.js';
import { DEFAULT_DECK_SIZE, GENERATE_RANDOM_DECKS } from '../core/constants.js';
import { TypeCategoryMap } from '../core/helpers/card.js';
import { generateRandomDeck } from '../core/helpers/deck.js';
import { generateID } from '../core/helpers/utils.js';

export const runGame = async () => {
    const types = cardDefinitions.flatMap(c => c.types);
    const typesMissingCat = types.filter(t => !TypeCategoryMap[t]);
    typesMissingCat ?? console.warn('Types still missing a category!', typesMissingCat);

    const activeCardPool = [getCardDefinition('unit_nanook_king_of_the_tundra'), getCardDefinition('unit_nekker'), getCardDefinition('unit_catapult'), getCardDefinition('special_impenetrable_fog'), getCardDefinition('unit_foglet'), getCardDefinition('unit_ancient_foglet') ];
    const passiveCardPool = cardDefinitions.slice(0, 10);

    let testActiveDeck: CardDefinition[] = Array.from({ length: DEFAULT_DECK_SIZE }, (_, i) => activeCardPool[i % activeCardPool.length]);
    let testPassiveDeck: CardDefinition[] = Array.from({ length: DEFAULT_DECK_SIZE }, (_, i) => passiveCardPool[i % passiveCardPool.length]);

    if(GENERATE_RANDOM_DECKS) {
        testActiveDeck = generateRandomDeck(cardDefinitions);
        testPassiveDeck = generateRandomDeck(cardDefinitions);
    }

    const ivoryDeck: GameDeck = {
        name: 'Ivory Deck',
        cards: testActiveDeck,
        leader: getLeaderDefinition('leader_ursine_ritual'),
    };
    const obsidianDeck: GameDeck = {
        name: 'Obsidian Deck',
        cards: testPassiveDeck,
        leader: getLeaderDefinition('leader_ursine_ritual'),
    };
    console.log('Ivory Deck:', ivoryDeck);
    console.log('Obsidian Deck:', obsidianDeck);

    const config: GameConfig = {
        controllers: {
            ivory: uiPlayer,
            obsidian: uiPlayer
        },
        id: generateID(),
    }
    resetGameState(ivoryDeck, obsidianDeck, config);
    await gameLoop(config);
}