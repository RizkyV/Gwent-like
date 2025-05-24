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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
console.log(cardDefinitions);
console.log(createCardInstance(cardDefinitions[0]));
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
