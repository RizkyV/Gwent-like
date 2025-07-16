import { createRoot, Root } from "react-dom/client";
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
import { CardInstance, EffectSource, PlayerRole, RowType } from "../core/types";
import { DEFAULT_LOCAL_PLAYER } from "../core/constants";
import { create } from "zustand";
import { flipCoin } from "../core/helpers/utils";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Types from "./types";

/**
 * TODO:
 * get card controller should return the player that is currently playing the card - if applicable
 * If action is engine initiated - do not block 
 * move stickyimagepreview from card to game controller
 * UI needs to expose functions to the state - allowing the state to tell the UI that a player is now playing a card (eg. Cantarella)
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * If no legal targets - just play without triggering the effect
 * UI Multi targeting
 * Mulligan
 * Potential hook queueing - potential timing issues
*/

export type uiState = {
  selectedHandCard: CardInstance | null;
  isTargeting: boolean;
  pendingAction: PendingAction | null;
  uiPhase: UIPhase;
  playInitiator: PlayInitiator | null;
  setSelectedHandCard: (card: CardInstance | null) => void;
  setIsTargeting: (isTargeting: boolean) => void;
  flipTargeting: () => void;
  setPendingAction: (action: PendingAction | null) => void;
  setUIPhase: (phase: UIPhase) => void;
  setPlayInitiator: (initiator: PlayInitiator | null) => void;
  setState: (state: Partial<uiState>) => void;
};
export type UIPhase = "waiting" | "playing" | "targeting";
export type PlayInitiator = "user" | "engine";
export type PendingAction =
  | { type: "play"; card: CardInstance; rowType: RowType; player: PlayerRole; index: number }
  | { type: "ability"; card: CardInstance }
  | { type: "target"; effectSource: EffectSource };

export const uiStateStore = create<uiState>((set) => ({
  selectedHandCard: null,
  isTargeting: false,
  pendingAction: null,
  uiPhase: "waiting",
  playInitiator: null,
  setSelectedHandCard: (card) => set({ selectedHandCard: card }),
  setIsTargeting: (isTargeting) => set({ isTargeting }),
  flipTargeting: () => set((state) => ({ isTargeting: !state.isTargeting })),
  setPendingAction: (action) => set({ pendingAction: action }),
  setUIPhase: (phase) => set({ uiPhase: phase }),
  setPlayInitiator: (initiator) => set({ playInitiator: initiator }),
  setState: (state) => set({ ...state }),
}));
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

  if (!gameState) return <div>{t('ui.loading')}</div>;

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/Gwent-like" element={<>
            {/*       <GlobalCancelOnContextMenu /> */}
            {false && <h1 className="app__title">GWENT-LIKE</h1>}

            <GameInfo gameState={gameState} localPlayer={localPlayer} />
            <GameController gameState={gameState} localPlayer={localPlayer} />
          </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export function useUrlLocale() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const lang = parts[2];
    if (lang) i18n.changeLanguage(lang);
  }, [window.location.search]);
};

/* export const GlobalCancelOnContextMenu = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const { uiPhase } = uiStateStore.getState();
      console.log("Global contextmenu event fired", { phase: uiPhase });
      if (uiPhase === "playing") {
        e.preventDefault();
        cancelPlayIfAllowed();
      }
    };
    document.addEventListener("contextmenu", handler);
    return () => {
      document.removeEventListener("contextmenu", handler);
    };
  }, []);
  return null;
}; */

const rootElement = document.getElementById('root')!;

// Use a global variable to store the root instance
declare global {
  interface Window { __GWENT_ROOT__: Root | undefined }
}

if (!window.__GWENT_ROOT__) {
  window.__GWENT_ROOT__ = createRoot(rootElement);
}

window.__GWENT_ROOT__.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);