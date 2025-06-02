import { CardDefinition, CardInstance, PlayerRole, StatusId } from "../types";

export const buildDeck = (deck: CardDefinition[], owner: PlayerRole): CardInstance[] =>
    deck.map(cardDef => ({
        instanceId: crypto.randomUUID(),
        baseCard: cardDef,
        owner,
        currentPower: cardDef.basePower,
        statuses: new Set(),
    }));

export function createCardInstance(def: CardDefinition, player: PlayerRole): CardInstance {
    return {
        instanceId: crypto.randomUUID(),
        baseCard: def,
        owner: player,
        currentPower: def.basePower,
        statuses: new Set<StatusId>(),
    };
}
