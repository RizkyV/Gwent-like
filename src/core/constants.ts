/**
 * Game Rules
 */
export const CARDS_DRAWN_ROUND_1 = 10;
export const CARDS_DRAWN_ROUND_2 = 3;
export const CARDS_DRAWN_ROUND_3 = 3;

export const INITIAL_HAND_SIZE = 10;
export const MAX_HAND_SIZE = 10;
export const MAX_ROUNDS = 3;
export const MAX_ROW_SIZE = 9;

export const POINTS_TO_WIN_ROUND = null; // null means "most points wins"
/**
 * Deckbuilding Rules
 */
export const DEFAULT_PROVISION_LIMIT = 150;
export const DEFAULT_DECK_SIZE = 25;
/**
 * Test Configuration
 */
export const ALWAYS_WHITE_START_PLAYER = false; // If true, the white player always starts first
export const ALWAYS_BLACK_START_PLAYER = true; // If true, the black player always starts first
export const DUMMY_DELAY = 2000; // Delay in milliseconds for dummy player actions
export const STATE_DELAY = 300; // Delay in milliseconds for state updates
export const SHUFFLE_DECKS = true; // If true, decks are shuffled before the game starts
export const DEFAULT_ACTIVE_PLAYER = 'white'; // Default active player at the start of the game