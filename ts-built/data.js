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
var boostAllFriendlyUnits = function (state, context) {
    var rows = getRows(state, context.player);
    var boostedRows = rows.map(function (row) { return (__assign(__assign({}, row), { cards: row.cards.map(function (card) { return (__assign(__assign({}, card), { currentPower: card.currentPower + 1 })); }) })); });
    return setRows(state, context.player, boostedRows);
};
var cardDefinitions = [
    {
        id: 'card1',
        name: 'Card One',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
        onPlay: boostAllFriendlyUnits
    }
];
