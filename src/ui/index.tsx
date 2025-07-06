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

/**
 * TODO:
 * UI Targeting rows
 * UI needs to expose functions to the state - allowing the state to tell the UI that a player is now playing a card (eg. Cantarella)
 * Therefore the dragging will need to also be click - then click again on drop zone. If the player stops dragging - it needs to stay in that state and wait for cancel or click on drop zone.
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * If no legal targets - just play without triggering the effect
 * If the player regrets - a right click should reset the whole playing state
 * Change white/black to playerWhite/playerBlack
 * UI Multi targeting
 * Mulligan
 * Potential hook queueing - potential timing issues
*/

const App = () => {
  const [gameState, setGameState] = useState(null);

  useUrlLocale(); // Initialize locale from URL parameters

  const { t } = useTranslation();

  useEffect(() => {
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

      <GameInfo gameState={gameState} />
      <GameController gameState={gameState} />
    </div>
  );
};

export function useUrlLocale() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lng = params.get("lng");
    if (lng) i18n.changeLanguage(lng);
  }, [window.location.search]);
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);
