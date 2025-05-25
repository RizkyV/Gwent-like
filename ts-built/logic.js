var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
//Gameplay logic
function createCardInstance(def) {
    return {
        instanceId: crypto.randomUUID(), // or your UUID generator
        baseCard: def,
        currentPower: def.basePower,
        statuses: new Set(),
    };
}
function resolveCardPlay(card, state, player) {
    var _a, _b;
    var effect = (_b = (_a = card.baseCard.effects) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.hook === 'onPlay'; })) === null || _b === void 0 ? void 0 : _b.effect;
    if (!effect)
        return state;
    return effect(state, { source: card, player: player });
}
function createInitialGameState(friendlyDeck, enemyDeck) {
    return {
        players: {
            friendly: {
                hand: [],
                deck: __spreadArray([], friendlyDeck, true),
                graveyard: [],
                rows: [
                    { id: 'melee', cards: [] },
                    { id: 'ranged', cards: [] }
                ],
                passed: false,
                roundWins: 0
            },
            enemy: {
                hand: [],
                deck: __spreadArray([], enemyDeck, true),
                graveyard: [],
                rows: [
                    { id: 'melee', cards: [] },
                    { id: 'ranged', cards: [] }
                ],
                passed: false,
                roundWins: 0
            }
        },
        currentPlayer: 'friendly',
        currentRound: 1,
        phase: 'draw',
        turn: {
            hasActivatedAbility: false,
            hasPlayedCard: false
        }
    };
}
function startRound(state) {
    var newState = state;
    newState = drawCards(newState, 'friendly', 10);
    newState = drawCards(newState, 'enemy', 10);
    return __assign(__assign({}, newState), { phase: 'play', currentPlayer: flipCoin ? 'friendly' : 'enemy' // the one that lost last
     });
}
function checkEndOfRound(state) {
    var bothPassed = state.players.friendly.passed && state.players.enemy.passed; //or both players hands are empty
    if (bothPassed) {
        // TODO: Calculate round winner, add to roundWins, reset for next round or end game
        return __assign(__assign({}, state), { phase: 'roundEnd' });
    }
    return state;
}
function resetForNewRound(state) {
    //TODO: clear rows, check if done with game
    state.currentRound += 1;
    state.phase = 'draw';
    state.players.friendly.passed = false;
    state.players.enemy.passed = false;
    return state;
}
function newTurn(state) {
    state.turn = { hasActivatedAbility: false, hasPlayedCard: false };
    state.currentPlayer = state.currentPlayer === 'friendly' ? 'enemy' : 'friendly';
    return state;
}
function gameLoop(config, initialState) {
    return __awaiter(this, void 0, void 0, function () {
        var state, controller, newState, bothPassed, bothHandsEmpty, friendlyPoints, enemyPoints, friendlyWins, enemyWins, maxRoundsReached, gameIsOver, winner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = initialState;
                    _a.label = 1;
                case 1:
                    if (!(state.phase !== 'gameOver')) return [3 /*break*/, 4];
                    // --- Phase: Draw ---
                    if (state.phase === 'draw') {
                        console.log("Starting round ".concat(state.currentRound));
                        state = drawCards(state, 'friendly', 3); // e.g. draw 3 each round
                        state = drawCards(state, 'enemy', 3);
                        // Trigger round-start effects
                        state = triggerHook('onRoundStart', state, { player: 'friendly', source: null });
                        state = triggerHook('onRoundStart', state, { player: 'enemy', source: null });
                        state.phase = 'play';
                        return [3 /*break*/, 1];
                    }
                    if (!(state.phase === 'play')) return [3 /*break*/, 3];
                    console.log("Player ".concat(state.currentPlayer, "'s turn."));
                    controller = config.controllers[state.currentPlayer];
                    return [4 /*yield*/, controller.makeMove(state, state.currentPlayer)];
                case 2:
                    newState = _a.sent();
                    state = newTurn(newState);
                    bothPassed = state.players.friendly.passed && state.players.enemy.passed;
                    bothHandsEmpty = state.players.friendly.hand.length === 0 && state.players.enemy.hand.length === 0;
                    if (bothPassed || bothHandsEmpty) {
                        state.phase = 'roundEnd';
                        return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 1];
                case 3:
                    // --- Phase: End (End of Round) ---
                    if (state.phase === 'roundEnd') {
                        friendlyPoints = state.players.friendly.rows.flatMap(function (r) { return r.cards; }).reduce(function (sum, c) { return sum + c.currentPower; }, 0);
                        enemyPoints = state.players.enemy.rows.flatMap(function (r) { return r.cards; }).reduce(function (sum, c) { return sum + c.currentPower; }, 0);
                        if (friendlyPoints > enemyPoints) {
                            state.players.friendly.roundWins += 1;
                            console.log("Round ".concat(state.currentRound, " goes to Friendly (").concat(friendlyPoints, " vs ").concat(enemyPoints, ")"));
                        }
                        else if (enemyPoints > friendlyPoints) {
                            state.players.enemy.roundWins += 1;
                            console.log("Round ".concat(state.currentRound, " goes to Enemy (").concat(enemyPoints, " vs ").concat(friendlyPoints, ")"));
                        }
                        else {
                            console.log("Round ".concat(state.currentRound, " is a tie! (").concat(friendlyPoints, " vs ").concat(enemyPoints, ")"));
                        }
                        // Trigger round-end effects
                        state = triggerHook('onRoundEnd', state, { player: 'friendly', source: null });
                        state = triggerHook('onRoundEnd', state, { player: 'enemy', source: null });
                        // Clear the board
                        state.players.friendly.rows.forEach(function (row) { return row.cards = []; });
                        state.players.enemy.rows.forEach(function (row) { return row.cards = []; });
                        friendlyWins = state.players.friendly.roundWins;
                        enemyWins = state.players.enemy.roundWins;
                        maxRoundsReached = state.currentRound >= 3;
                        gameIsOver = friendlyWins === 2 || enemyWins === 2 || maxRoundsReached;
                        if (gameIsOver) {
                            state.phase = 'gameOver';
                            winner = friendlyWins > enemyWins ? 'Friendly' : (enemyWins > friendlyWins ? 'Enemy' : 'Draw');
                            console.log("Game Over! Winner: ".concat(winner));
                            return [3 /*break*/, 4];
                        }
                        // Prepare next round
                        state = resetForNewRound(state);
                        return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function passTurn(state, player) {
    var _a;
    var playerState = state.players[player];
    if (playerState.passed) {
        console.warn("".concat(player, " has already passed this turn."));
        return state; // Cannot pass again
    }
    return __assign(__assign({}, state), { players: __assign(__assign({}, state.players), (_a = {}, _a[player] = __assign(__assign({}, playerState), { passed: true }), _a)), turn: __assign(__assign({}, state.turn), { hasPlayedCard: true // Passing counts as playing a card
         }) });
}
var dummyPlayer = {
    type: 'human',
    makeMove: function (state, role) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("It's ".concat(role, "'s turn."));
            console.log('Hand: ', state.players[role].hand.map(function (c) { return c.baseCard.name; }));
            console.log('Rows: ', state.players[role].rows.map(function (r) { return ({
                id: r.id,
                cards: r.cards.map(function (c) { return c.baseCard.name; })
            }); }));
            return [2 /*return*/, passTurn(state, role)]; // For now, just pass the turn
        });
    }); }
};
/*
 * Core gameplay hooks for effect system
 * - onPlay: when a card is played from hand
 * - onTargeted: when a card becomes the target of an effect or ability
 * - onTurnStart: start of a player's turn (e.g., for ticking effects like poison)
 * - onTurnEnd: end of a player's turn (cleanup, temporary effect expiration)
 * - onDamaged: when a card takes damage (used for reactions, enrage, armor)
 * - onDeath: when a card dies and leaves the board
 * - onSummoned: when a card enters play (includes summoned or spawned units)
 * - onDraw: when a card is drawn from the deck
 * - onDiscard: when a card is discarded from hand
 * - onGraveyardEnter: when a card enters the graveyard (includes death or discard)
 * - onMoveToRow: when a card moves between rows (e.g., melee to ranged)
 * - onRoundStart: start of a round (reset or initialize round effects)
 * - onRoundEnd: end of a round (clear or trigger round-end logic)
 * - onAbilityActivated: when a card's active ability is used (e.g., once-per-turn)
*/
/*
 * TODO:
 * - function that builds start game state
 * - deck handling
 * - hand handling
 * - draw
*/
/*
* Helpers
*/
function flipCoin() {
    return Math.random() < 0.5;
}
function drawCards(state, player, count) {
    var _a;
    var playerState = state.players[player];
    var drawn = playerState.deck.slice(0, count);
    var newDeck = playerState.deck.slice(count);
    return __assign(__assign({}, state), { players: __assign(__assign({}, state.players), (_a = {}, _a[player] = __assign(__assign({}, playerState), { hand: __spreadArray(__spreadArray([], playerState.hand, true), drawn, true), deck: newDeck }), _a)) });
}
function getRows(state, player) {
    return player === 'friendly' ? state.players.friendly.rows : state.players.enemy.rows;
}
function setRows(state, player, rows) {
    return __assign(__assign({}, state), (player === 'friendly'
        ? { friendlyRows: rows }
        : { enemyRows: rows }));
}
function getRowById(rows, id) {
    return rows.find(function (row) { return row.id === id; });
}
function addStatus(card, status) {
    var newStatuses = new Set(card.statuses);
    newStatuses.add(status);
    return __assign(__assign({}, card), { statuses: newStatuses });
}
function removeStatus(card, status) {
    var newStatuses = new Set(card.statuses);
    newStatuses.delete(status);
    return __assign(__assign({}, card), { statuses: newStatuses });
}
function hasStatus(card, status) {
    return card.statuses.has(status);
}
function canTargetCard(card, state) {
    for (var _i = 0, _a = Array.from(card.statuses); _i < _a.length; _i++) {
        var status_1 = _a[_i];
        var effect = statusEffects[status_1];
        if ((effect === null || effect === void 0 ? void 0 : effect.canBeTargeted) && !effect.canBeTargeted(card, state)) {
            return false; // one status disallows targeting
        }
    }
    return true; // no status disallows targeting
}
function triggerHook(hook, state, context) {
    var _a;
    var newState = state;
    // Helper to get all CardInstances in play
    var allCards = __spreadArray(__spreadArray([], state.players.friendly.rows, true), state.players.enemy.rows, true).flatMap(function (row) { return row.cards; });
    for (var _i = 0, allCards_1 = allCards; _i < allCards_1.length; _i++) {
        var card = allCards_1[_i];
        var hookedEffects = ((_a = card.baseCard.effects) === null || _a === void 0 ? void 0 : _a.filter(function (e) { return e.hook === hook; })) || [];
        for (var _b = 0, hookedEffects_1 = hookedEffects; _b < hookedEffects_1.length; _b++) {
            var effect = hookedEffects_1[_b].effect;
            var scopedContext = __assign(__assign({}, context), { source: card, player: card.baseCard.isToken ? context.player : getCardOwner(state, card) });
            newState = effect(newState, scopedContext);
        }
    }
    return newState;
}
function getCardOwner(state, card) {
    var cardId = card.instanceId;
    var friendlyHasCard = state.players.friendly.rows.some(function (row) {
        return row.cards.some(function (c) { return c.instanceId === cardId; });
    });
    if (friendlyHasCard)
        return 'friendly';
    var enemyHasCard = state.players.enemy.rows.some(function (row) {
        return row.cards.some(function (c) { return c.instanceId === cardId; });
    });
    if (enemyHasCard)
        return 'enemy';
    throw new Error("Could not determine owner of card with instanceId: ".concat(cardId));
}
function updateCardInState(state, cardId, updater) {
    var updateRows = function (rows) {
        return rows.map(function (row) { return (__assign(__assign({}, row), { cards: row.cards.map(function (card) {
                return card.instanceId === cardId ? updater(card) : card;
            }) })); });
    };
    // Try friendly player
    var updatedFriendlyRows = updateRows(state.players.friendly.rows);
    var foundInFriendly = updatedFriendlyRows.some(function (r, i) {
        return r.cards.some(function (c, j) { return c.instanceId === cardId && c !== state.players.friendly.rows[i].cards[j]; });
    });
    if (foundInFriendly) {
        return __assign(__assign({}, state), { players: __assign(__assign({}, state.players), { friendly: __assign(__assign({}, state.players.friendly), { rows: updatedFriendlyRows }) }) });
    }
    // Try enemy player
    var updatedEnemyRows = updateRows(state.players.enemy.rows);
    var foundInEnemy = updatedEnemyRows.some(function (r, i) {
        return r.cards.some(function (c, j) { return c.instanceId === cardId && c !== state.players.enemy.rows[i].cards[j]; });
    });
    if (foundInEnemy) {
        return __assign(__assign({}, state), { players: __assign(__assign({}, state.players), { enemy: __assign(__assign({}, state.players.enemy), { rows: updatedEnemyRows }) }) });
    }
    throw new Error("Card with instanceId ".concat(cardId, " not found in any player's rows."));
}
window.onload = function () { return __awaiter(_this, void 0, void 0, function () {
    var friendlyDeck, enemyDeck, state, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                friendlyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
                enemyDeck = cardDefinitions.slice(10, 20).map(createCardInstance);
                state = createInitialGameState(friendlyDeck, enemyDeck);
                config = {
                    controllers: {
                        friendly: dummyPlayer,
                        enemy: dummyPlayer
                    }
                };
                console.log(state);
                console.log('Game starting...');
                return [4 /*yield*/, gameLoop(config, state)];
            case 1:
                _a.sent();
                console.log('Game finished.');
                return [2 /*return*/];
        }
    });
}); };
