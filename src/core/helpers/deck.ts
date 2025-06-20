import { SHUFFLE_DECKS } from "../constants";
import { CardDefinition, CardInstance, PlayerRole } from "../types";

export function buildDeck(deck: CardDefinition[], owner: PlayerRole): CardInstance[] {
    const gameDeck: CardInstance[] = deck.map(cardDef => createCardInstance(cardDef, owner));
    if (SHUFFLE_DECKS) {
        shuffleDeck(gameDeck);
    }
    return gameDeck;
}

export function shuffleDeck(deck: CardInstance[]): CardInstance[] {
    //Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function createCardInstance(def: CardDefinition, player: PlayerRole): CardInstance {
    return {
        instanceId: crypto.randomUUID(),
        baseCard: def,
        owner: player,
        currentPower: def.basePower,
        currentArmor: def.baseArmor,
        currentBasePower: def.basePower,
        statuses: new Map(
            (def.innateStatuses ?? []).map(status =>
                Array.isArray(status) ? [status[0], status[1]] : [status, true]
            )
        ),
        abilityCharges: def.abilityInitialCharges,
        abilityCounter: 0,
        abilityCooldown: 0
    };
}
