import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { subscribe } from "../core/state";
import { runGame } from "../cli/main";

import "./style.scss";
import GameInfo from "./game-info";
import GameController from "./game-controller";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

/**
 * TODO:
 * Implement summoning sickness
 * Implement hooks (one at a time)
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * If no legal targets - just play without triggering the effect
 * UI Multi targeting
 * Mulligan
 * Potential hook queueing - potential timing issues
*/

const App = () => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribe(setGameState);
    // Start the game
    runGame();
    // Cleanup on unmount
    return unsubscribe;
  }, []);

  //console.debug("App component mounted, gameState:", gameState);
  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="app">
      {false && <h1 className="app__title">GWENT-LIKE</h1>}

      <GameInfo gameState={gameState} />
      <GameController gameState={gameState} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);
