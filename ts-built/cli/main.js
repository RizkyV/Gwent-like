var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cardDefinitions } from '../core/cards.js';
import { createCardInstance } from '../core/logic.js';
import { createInitialGameState } from '../core/state.js';
import { dummyPlayer } from '../controllers/dummyPlayer.js';
import { gameLoop } from '../core/engine.js';
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting game...');
    const friendlyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
    console.log('Creating friendly deck:', friendlyDeck);
    const enemyDeck = cardDefinitions.slice(10, 20).map(createCardInstance);
    console.log('Creating enemy deck:', enemyDeck);
    const state = createInitialGameState(friendlyDeck, enemyDeck);
    console.log('Initial game state created:', state);
    const config = {
        controllers: {
            friendly: dummyPlayer,
            enemy: dummyPlayer
        }
    };
    console.log(state);
    console.log('Game starting...');
    yield gameLoop(config, state);
    console.log('Game finished.');
}))();
