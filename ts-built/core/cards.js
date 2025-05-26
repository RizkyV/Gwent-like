import { getRows, setRows, getCardOwner, updateCardInState } from './logic.js';
export const boostAllFriendlyUnits = (state, context) => {
    const rows = getRows(state, context.player);
    const boostedRows = rows.map(row => (Object.assign(Object.assign({}, row), { cards: row.cards.map(card => (Object.assign(Object.assign({}, card), { currentPower: card.currentPower + 1 }))) })));
    return setRows(state, context.player, boostedRows);
};
export const boostSelfOnEnemyDamaged = (state, context) => {
    var _a;
    const { source } = context;
    const damagedCard = (_a = context.metadata) === null || _a === void 0 ? void 0 : _a.damagedCard;
    if (!damagedCard)
        return state;
    const sourceOwner = getCardOwner(state, source);
    const damagedOwner = getCardOwner(state, damagedCard);
    if (sourceOwner === damagedOwner)
        return state;
    return updateCardInState(state, source.instanceId, card => (Object.assign(Object.assign({}, card), { currentPower: card.currentPower + 1 })));
};
export const cardDefinitions = [
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
    },
    {
        id: 'card3',
        name: 'Card Three',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card4',
        name: 'Card Four',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card5',
        name: 'Card Five',
        type: ['warrior'],
        basePower: 10,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card6',
        name: 'Card Six',
        type: ['warrior'],
        basePower: 6,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card7',
        name: 'Card Seven',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card8',
        name: 'Card Eight',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card9',
        name: 'Card Nine',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    },
    {
        id: 'card10',
        name: 'Card Ten',
        type: ['warrior'],
        basePower: 5,
        category: 'unit',
        provisionCost: 5,
    }
];
