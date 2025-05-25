var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { passTurn } from '../core/engine.js';
export const dummyPlayer = {
    type: 'human',
    makeMove: (state, role) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`It's ${role}'s turn.`);
        console.log('Hand: ', state.players[role].hand.map(c => c.baseCard.name));
        console.log('Rows: ', state.players[role].rows.map(r => ({
            id: r.id,
            cards: r.cards.map(c => c.baseCard.name)
        })));
        return passTurn(state, role);
    })
};
