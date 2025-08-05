/**
 * Game Rules
 */
export const CARDS_DRAWN_ROUND_1 = 10;
export const CARDS_DRAWN_ROUND_2 = 3;
export const CARDS_DRAWN_ROUND_3 = 3;

export const MAX_HAND_SIZE = 10;
export const MAX_ROUNDS = 3;
export const MAX_ROW_SIZE = 9;

export const POINTS_TO_WIN_ROUND = null; // null means "most points wins"
/**
 * Deckbuilding Rules
 */
export const MAXIMUM_PROVISION_LIMIT = 150;
export const MINIMUM_DECK_SIZE = 25;
export const ANY_CARD_AS_LEADER = false;
/**
 * Test Configuration
 */
export const ALWAYS_IVORY_START_PLAYER = true; // If true, the ivory player always starts first
export const ALWAYS_OBSIDIAN_START_PLAYER = false; // If true, the obsidian player always starts first
export const DUMMY_DELAY = 2000; // Delay in milliseconds for dummy player actions
//export const STATE_DELAY = 100; // Delay in milliseconds for state updates
export const SHUFFLE_DECKS = true; // If true, decks are shuffled before the game starts
export const DEFAULT_LOCAL_PLAYER = 'ivory'; // If set, this player will be the local player in the UI. If null, a random player will be chosen based on the coin flip.
export const LOCAL_PLAYER_CONTROLS_BOTH = true; // If true, the local player controls both players in the UI. If false, each player is controlled by a separate player.
export const GENERATE_RANDOM_DECKS = true; // If true, random decks will be generated for both players