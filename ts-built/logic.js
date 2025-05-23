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
function createCardInstance(def) {
    return {
        instanceId: crypto.randomUUID(), // or your UUID generator
        baseCard: def,
        currentPower: def.basePower
    };
}
function resolveCardPlay(card, state, player) {
    var effect = card.baseCard.onPlay;
    if (!effect)
        return state;
    return effect(state, { source: card, player: player });
}
console.log(cardDefinitions);
console.log(createCardInstance(cardDefinitions[0]));
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
