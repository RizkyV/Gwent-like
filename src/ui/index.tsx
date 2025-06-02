import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { subscribe } from "../core/state";
import { runGame } from "../cli/main";

import "./style.scss";
import GameInfo from "./game-info";
import GameController from "./game-controller";

/**
 * TODO:
 * Implement hooks (one at a time)
 * Rework card ownership. Turn getCardOwner into getCardController, and in initial game state assign each card an owner
 * If a player has passed the turn should not turn to them :)
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * UI Choose row + index to play on
 * Allow UI to activate abilities
 * UI Multi targeting
 * Mulligan
 * Track UI state via turn state? isTargeting, isChoosingRow, selectedCard etc.
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
root.render(<App />);
