import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { runGame } from "../cli/main";
import Hand from "./hand";
import { GameState } from "../core/types";
import Row from "./row";
import "./style.scss"; // Import the SCSS file

const App = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  React.useEffect(() => {
    runGame(setGameState);
  }, []);

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
