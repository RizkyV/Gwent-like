import { statusEffects } from './statuses.js';
export function createCardInstance(def) {
    return {
        instanceId: crypto.randomUUID(),
        baseCard: def,
        currentPower: def.basePower,
        statuses: new Set(),
    };
}
export function resolveCardPlay(card, state, player) {
    var _a, _b;
    const effect = (_b = (_a = card.baseCard.effects) === null || _a === void 0 ? void 0 : _a.find(e => e.hook === 'onPlay')) === null || _b === void 0 ? void 0 : _b.effect;
    if (!effect)
        return state;
    return effect(state, { source: card, player });
}
export function drawCards(state, player, count) {
    const playerState = state.players[player];
    const drawn = playerState.deck.slice(0, count);
    const newDeck = playerState.deck.slice(count);
    return Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { [player]: Object.assign(Object.assign({}, playerState), { hand: [...playerState.hand, ...drawn], deck: newDeck }) }) });
}
export function getRows(state, player) {
    return player === 'friendly' ? state.players.friendly.rows : state.players.enemy.rows;
}
export function setRows(state, player, rows) {
    return Object.assign(Object.assign({}, state), (player === 'friendly'
        ? { friendlyRows: rows }
        : { enemyRows: rows }));
}
export function getRowById(rows, id) {
    return rows.find(row => row.id === id);
}
export function addStatus(card, status) {
    const newStatuses = new Set(card.statuses);
    newStatuses.add(status);
    return Object.assign(Object.assign({}, card), { statuses: newStatuses });
}
export function removeStatus(card, status) {
    const newStatuses = new Set(card.statuses);
    newStatuses.delete(status);
    return Object.assign(Object.assign({}, card), { statuses: newStatuses });
}
export function hasStatus(card, status) {
    return card.statuses.has(status);
}
export function canTargetCard(card, state) {
    for (const status of Array.from(card.statuses)) {
        const effect = statusEffects[status];
        if ((effect === null || effect === void 0 ? void 0 : effect.canBeTargeted) && !effect.canBeTargeted(card, state)) {
            return false;
        }
    }
    return true;
}
export function triggerHook(hook, state, context) {
    var _a;
    let newState = state;
    const allCards = [...state.players.friendly.rows, ...state.players.enemy.rows].flatMap(row => row.cards);
    for (const card of allCards) {
        const hookedEffects = ((_a = card.baseCard.effects) === null || _a === void 0 ? void 0 : _a.filter(e => e.hook === hook)) || [];
        for (const { effect } of hookedEffects) {
            const scopedContext = Object.assign(Object.assign({}, context), { source: card, player: card.baseCard.isToken ? context.player : getCardOwner(state, card) });
            newState = effect(newState, scopedContext);
        }
    }
    return newState;
}
export function getCardOwner(state, card) {
    const cardId = card.instanceId;
    const friendlyHasCard = state.players.friendly.rows.some(row => row.cards.some(c => c.instanceId === cardId));
    if (friendlyHasCard)
        return 'friendly';
    const enemyHasCard = state.players.enemy.rows.some(row => row.cards.some(c => c.instanceId === cardId));
    if (enemyHasCard)
        return 'enemy';
    throw new Error(`Could not determine owner of card with instanceId: ${cardId}`);
}
export function updateCardInState(state, cardId, updater) {
    const updateRows = (rows) => rows.map(row => (Object.assign(Object.assign({}, row), { cards: row.cards.map(card => card.instanceId === cardId ? updater(card) : card) })));
    const updatedFriendlyRows = updateRows(state.players.friendly.rows);
    const foundInFriendly = updatedFriendlyRows.some((r, i) => r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.friendly.rows[i].cards[j]));
    if (foundInFriendly) {
        return Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { friendly: Object.assign(Object.assign({}, state.players.friendly), { rows: updatedFriendlyRows }) }) });
    }
    const updatedEnemyRows = updateRows(state.players.enemy.rows);
    const foundInEnemy = updatedEnemyRows.some((r, i) => r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.enemy.rows[i].cards[j]));
    if (foundInEnemy) {
        return Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { enemy: Object.assign(Object.assign({}, state.players.enemy), { rows: updatedEnemyRows }) }) });
    }
    throw new Error(`Card with instanceId ${cardId} not found in any player's rows.`);
}
