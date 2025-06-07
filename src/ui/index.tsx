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
 * Implement hooks (one at a time)
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * Playing special cards
 * Playing resource cards 
 * Allow UI to activate abilities
 * UI Multi targeting
 * Mulligan
 * Potential hook queueing - potential timing issues
 * Styling the UI to make it fill the screen correctly - place game-info absolutely in the top right corner
 * Remove previous play buttons - and rework target button to just use the whole card
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
