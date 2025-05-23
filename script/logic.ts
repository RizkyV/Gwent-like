function createCardInstance(def: CardDefinition): CardInstance {
    return {
        instanceId: crypto.randomUUID(), // or your UUID generator
        baseCard: def,
        currentPower: def.basePower
    };
}

function resolveCardPlay(card: CardInstance, state: GameState, player: PlayerRole): GameState {
    const effect = card.baseCard.onPlay;
    if (!effect) return state;
    return effect(state, { source: card, player });
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
function getRows(state: GameState, player: PlayerRole): Row[] {
    return player === 'friendly' ? state.players.friendly.rows : state.players.enemy.rows;
}
function setRows(state: GameState, player: PlayerRole, rows: Row[]): GameState {
    return {
        ...state,
        ...(player === 'friendly'
            ? { friendlyRows: rows }
            : { enemyRows: rows })
    };
}
function getRowById(rows: Row[], id: 'melee' | 'ranged'): Row | undefined {
    return rows.find(row => row.id === id);
}