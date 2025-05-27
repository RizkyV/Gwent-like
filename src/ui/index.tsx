import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { runGame } from "../cli/main";
import Hand from "./hand";
import { GameState } from "../core/types";
import Row from "./row";

const App = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  React.useEffect(() => {
    runGame(setGameState); // Pass the setter as a callback
  }, []);

  if (!gameState) return <div>Loading...</div>;

  // Helper to get cards from a specific row type
  const getRowCards = (player: "friendly" | "enemy", rowId: "melee" | "ranged") => {
    const row = gameState.players[player].rows.find(r => r.id === rowId);
    return row
      ? row.cards.map(card => ({
        name: card.baseCard.name,
        power: card.baseCard.basePower,
      }))
      : [];
  };

  return (
    <div style={{ background: "#181818", minHeight: "100vh", padding: "24px" }}>
      <h1 style={{ color: "#fff" }}>Gwent-like Game UI</h1>
      <Hand cards={gameState.players.friendly.hand.map(card => ({ name: card.baseCard.name, power: card.baseCard.basePower }))} title="Friendly Hand" />
      <Hand cards={gameState.players.enemy.hand.map(card => ({ name: card.baseCard.name, power: card.baseCard.basePower }))} title="Enemy Hand" />

      <Row cards={getRowCards("enemy", "ranged")} title="Enemy Ranged Row" />
      <Row cards={getRowCards("enemy", "melee")} title="Enemy Melee Row" />
      <Row cards={getRowCards("friendly", "melee")} title="Friendly Melee Row" />
      <Row cards={getRowCards("friendly", "ranged")} title="Friendly Ranged Row" />
    </div>
  )
};

const root = createRoot(document.getElementById('root')!);

root.render(<App />);
runGame();
