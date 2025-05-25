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
var boostSelfOnEnemyDamaged = function (state, context) {
    var _a;
    var source = context.source;
    var damagedCard = (_a = context.metadata) === null || _a === void 0 ? void 0 : _a.damagedCard;
    if (!damagedCard)
        return state;
    var sourceOwner = getCardOwner(state, source);
    var damagedOwner = getCardOwner(state, damagedCard);
    // Only trigger if the damaged card is on the opposing team
    if (sourceOwner === damagedOwner)
        return state;
    return updateCardInState(state, source.instanceId, function (card) { return (__assign(__assign({}, card), { currentPower: card.currentPower + 1 })); });
};
var cardDefinitions = [
    {
        id: 'card1',
        name: 'Card One',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
        effects: [
            {
                hook: 'onPlay',
                effect: boostAllFriendlyUnits
            }
        ]
    },
    {
        id: 'card2',
        name: 'Card Two',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
        effects: [
            {
                hook: 'onDamaged',
                effect: boostSelfOnEnemyDamaged
            }
        ]
    }
];
var statusEffects = {
    locked: {
        id: 'locked',
        description: 'Card cannot be moved or acted upon',
    },
    veil: {
        id: 'veil',
        description: 'Card cannot be targeted by enemy effects',
        canBeTargeted: function (card, state) { return false; },
    },
    poisoned: {
        id: 'poisoned',
        description: 'Card loses 1 power each turn',
        // You could add onTurnStart hooks here for ticking damage
    },
};
