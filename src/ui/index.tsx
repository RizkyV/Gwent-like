import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { subscribe } from "../core/state";
import { runGame } from "../cli/main";

import "./style.scss";
import GameInfo from "./game-info";
import GameController from "./game-controller";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { CardInstance, PlayerRole, RowType } from "../core/types";
import { DEFAULT_LOCAL_PLAYER } from "../core/constants";
import { create } from "zustand";
import { flipCoin } from "../core/helpers/utils";

/**
 * TODO:
 * UI Targeting rows
 * UI needs to expose functions to the state - allowing the state to tell the UI that a player is now playing a card (eg. Cantarella)
 * Therefore the dragging will need to also be click - then click again on drop zone. If the player stops dragging - it needs to stay in that state and wait for cancel or click on drop zone.
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * If no legal targets - just play without triggering the effect
 * If the player regrets - a right click should reset the whole playing state
 * Change ivory/obsidian to ivory/obsidian (iv/ob)
 * UI Multi targeting
 * Mulligan
 * Potential hook queueing - potential timing issues
*/

export type uiState = {
  selectedHandCard: CardInstance | null; // Instance ID of the selected card
  isTargeting: boolean; // Whether the UI is in a targeting state
  pendingAction: PendingAction | null; // The action that is pending (play or ability)
  setSelectedHandCard: (card: CardInstance | null) => void;
  setIsTargeting: (isTargeting: boolean) => void;
  flipTargeting: () => void; // Toggle the targeting state
  setPendingAction: (action: PendingAction | null) => void;
  setState: (state: Partial<uiState>) => void;
}
export type PendingAction =
  | { type: "play"; card: CardInstance; rowType: RowType; player: PlayerRole; index: number }
  | { type: "ability"; card: CardInstance };

export const uiStateStore = create<uiState>((set) => ({
  selectedHandCard: null,
  isTargeting: false,
  pendingAction: null,
  setSelectedHandCard: (card: CardInstance | null) => set({ selectedHandCard: card }),
  setIsTargeting: (isTargeting: boolean) => set({ isTargeting }),
  flipTargeting: () => set((state) => ({ isTargeting: !state.isTargeting })),
  setPendingAction: (action: PendingAction | null) => set({ pendingAction: action }),
  setState: (state: Partial<uiState>) => set({ ...state }),
}))
const App = () => {
  const [gameState, setGameState] = useState(null);
  const [localPlayer, setLocalPlayer] = useState<PlayerRole | null>(null);

  useUrlLocale(); // Initialize locale from URL parameters
  const { t } = useTranslation();

  useEffect(() => {
    //TODO: placeholder
    if (DEFAULT_LOCAL_PLAYER !== null) {
      setLocalPlayer(DEFAULT_LOCAL_PLAYER as PlayerRole);
    } else {
      flipCoin() ? setLocalPlayer(PlayerRole.Ivory) : setLocalPlayer(PlayerRole.Obsidian);
    }
    // Subscribe to state changes
    const unsubscribe = subscribe(setGameState);
    // Start the game
    runGame();
    // Cleanup on unmount
    return unsubscribe;
  }, []);

  if (!gameState) return <div>{t('game.loading')}</div>;

  return (
    <div className="app">
      {false && <h1 className="app__title">GWENT-LIKE</h1>}

      <GameInfo gameState={gameState} localPlayer={localPlayer} />
      <GameController gameState={gameState} localPlayer={localPlayer} />
    </div>
  );
};

export function useUrlLocale() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const lang = parts[2];
    if (lang) i18n.changeLanguage(lang);
  }, [window.location.search]);
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);
