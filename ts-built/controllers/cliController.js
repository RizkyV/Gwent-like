var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import promptSync from 'prompt-sync';
import { passTurn } from '../core/engine.js';
import { resolveCardPlay } from '../core/logic.js';
const prompt = promptSync();
export const humanCLIController = {
    type: 'human',
    makeMove: (state, role) => __awaiter(void 0, void 0, void 0, function* () {
        const playerState = state.players[role];
        console.log(`\n${role.toUpperCase()}'s TURN`);
        console.log(`Hand:`);
        playerState.hand.forEach((card, i) => {
            console.log(`${i}: ${card.baseCard.name} (${card.currentPower} power)`);
        });
        const cardIndex = parseInt(prompt('Choose a card to play (index): '), 10);
        const card = playerState.hand[cardIndex];
        if (!card) {
            console.log('Invalid selection, passing turn.');
            return passTurn(state, role);
        }
        const rowChoice = prompt('Choose a row to play on (melee/ranged): ');
        const validRow = rowChoice === 'melee' || rowChoice === 'ranged' ? rowChoice : 'melee';
        const updatedHand = playerState.hand.filter((_, i) => i !== cardIndex);
        const updatedRows = playerState.rows.map(row => row.id === validRow ? Object.assign(Object.assign({}, row), { cards: [...row.cards, card] }) : row);
        const newState = Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { [role]: Object.assign(Object.assign({}, playerState), { hand: updatedHand, rows: updatedRows }) }), turn: Object.assign(Object.assign({}, state.turn), { hasPlayedCard: true }) });
        return resolveCardPlay(card, newState, role);
    })
};
