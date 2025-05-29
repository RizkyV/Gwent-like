import { createRoot } from "react-dom/client";
import Hand from "./hand";
import Row from "./row";
import { subscribe } from "../core/state";
import { runGame } from "../cli/main";

import "./style.scss";
import { useEffect, useState } from "react";


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

  const getRowCards = (player: "friendly" | "enemy", rowId: "melee" | "ranged") => {
    const row = gameState.players[player].rows.find(r => r.id === rowId);
    return row
      ? row.cards.map(card => ({
        name: card.baseCard.name,
        power: card.baseCard.basePower,
        provisionCost: card.baseCard.provisionCost
      }))
      : [];
  };

  return (
    <div className="app">
      <h1 className="app__title">Gwent-like Game UI</h1>
      <Hand cards={gameState.players.enemy.hand.map(card => ({
        name: card.baseCard.name, power: card.baseCard.basePower,
        provisionCost: card.baseCard.provisionCost
      }))} title="Enemy Hand" />

      <Row cards={getRowCards("enemy", "ranged")} title="Enemy Ranged Row" />
      <Row cards={getRowCards("enemy", "melee")} title="Enemy Melee Row" />
      <Row cards={getRowCards("friendly", "melee")} title="Friendly Melee Row" />
      <Row cards={getRowCards("friendly", "ranged")} title="Friendly Ranged Row" />

      <Hand cards={gameState.players.friendly.hand.map(card => ({
        name: card.baseCard.name, power: card.baseCard.basePower,
        provisionCost: card.baseCard.provisionCost
      }))} title="Friendly Hand" />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
