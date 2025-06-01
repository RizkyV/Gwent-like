import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import Hand from "./hand";
import Row from "./row";
import { getPlayerPoints, playCard, subscribe } from "../core/state";
import { runGame } from "../cli/main";

import "./style.scss";
import GameInfo from "./game-info";
import GameBoard from "./game-board";

/**
 * TODO:
 * Implement hooks (one at a time)
 * Allow UI to play cards, end turns, pass rounds
 * Allow UI to activate abilities
 * Allow UI to target
 * Cleanup UI code - GameBoard component, GameController component
 * Mulligan
 * Rework card ownership. Turn getCardOwner into getCardController, and in initial game state assign each card an owner
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
      <GameBoard gameState={gameState} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
