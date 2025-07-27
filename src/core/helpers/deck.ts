import { DEFAULT_DECK_SIZE, DEFAULT_PROVISION_LIMIT, SHUFFLE_DECKS } from "../constants";
import { CardDefinition, CardInstance, PlayerRole } from "../types";
import { generateID } from "./utils";

export function buildDeck(deck: CardDefinition[], owner: PlayerRole): CardInstance[] {
    const gameDeck: CardInstance[] = deck.map(cardDef => createCardInstance(cardDef, owner));
    if (SHUFFLE_DECKS) {
        shuffleDeck(gameDeck);
    }
    return gameDeck;
}

export function shuffleDeck(deck: any[]): any[] {
    //Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function createCardInstance(def: CardDefinition, player: PlayerRole): CardInstance {
    return {
        instanceId: generateID(),
        baseCard: def,
        owner: player,
        controller: null,
        currentPower: def.basePower,
        currentArmor: def.baseArmor,
        currentBasePower: def.basePower,
        statuses: new Map(
            (def.innateStatuses ?? []).map(status =>
                Array.isArray(status) ? [status[0], status[1]] : [status, true]
            )
        ),
        abilityUsed: false,
        abilityCharges: def.abilityInitialCharges,
        abilityCounter: 0,
        abilityCooldown: 0
    };
}

export function generateRandomDeck(cardPool: CardDefinition[]): CardDefinition[] {
    // Filter out token cards
    const nonTokenPool = cardPool.filter(card => !card.isToken);

    if (nonTokenPool.length === 0) return [];

    // Shuffle for randomness
    const shuffled = shuffleDeck([...nonTokenPool]);

    const deck: CardDefinition[] = [];
    let totalProvision = 0;

    // Track how many times each card has been used
    const cardCounts: Record<string, number> = {};

    while (deck.length < DEFAULT_DECK_SIZE) {
        // Build a list of candidate cards, sorted by least used (to encourage diversity)
        const candidates = [...shuffled].sort((a, b) => {
            const countA = cardCounts[a.id] ?? 0;
            const countB = cardCounts[b.id] ?? 0;
            return countA - countB;
        });

        let added = false;
        for (const card of candidates) {
            const remainingSlots = DEFAULT_DECK_SIZE - (deck.length + 1);
            const newTotalProvision = totalProvision + card.provisionCost;
            const remainingProvision = DEFAULT_PROVISION_LIMIT - newTotalProvision;

            // If this is the last slot, just check provision
            if (remainingSlots === 0) {
                if (newTotalProvision <= DEFAULT_PROVISION_LIMIT) {
                    deck.push(card);
                    totalProvision = newTotalProvision;
                    cardCounts[card.id] = (cardCounts[card.id] ?? 0) + 1;
                    added = true;
                    break;
                }
                continue;
            }

            // Calculate the max average cost we can afford for the remaining slots
            const maxAvgCost = remainingProvision / remainingSlots;
            const minPoolAvgCost = Math.min(...nonTokenPool.map(c => c.provisionCost));
            if (maxAvgCost < minPoolAvgCost) continue;

            // Otherwise, add the card
            deck.push(card);
            totalProvision = newTotalProvision;
            cardCounts[card.id] = (cardCounts[card.id] ?? 0) + 1;
            added = true;
            break;
        }
        if (!added) {
            console.warn("Could not fill deck to required size with given provision limit and card pool.");
            break;
        }
    }

    return deck;
}