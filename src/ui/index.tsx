import { createRoot } from "react-dom/client";
import Hand from "./hand";
import Row from "./row";
import { getPlayerPoints, subscribe } from "../core/state";
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
        provisionCost: card.baseCard.provisionCost,
        description: card.baseCard.description
      }))
      : [];
  };

  return (
    <div className="app">
      {false && <h1 className="app__title">GWENT-LIKE</h1>}

      <div className="game-info">
        <div>Current Round: <strong>{gameState.currentRound}</strong></div>
        <div>
          <span>Friendly Wins: <strong>{gameState.players.friendly.roundWins}</strong></span>
          {" | "}
          <span>Enemy Wins: <strong>{gameState.players.enemy.roundWins}</strong></span>
        </div>
        <div className="player-points">
          <div className="player-points__enemy">
            Enemy Total Points: <strong>{getPlayerPoints(gameState.players.enemy)}</strong>
          </div>
          <div className="player-points__friendly">
            Friendly Total Points: <strong>{getPlayerPoints(gameState.players.friendly)}</strong>
          </div>
        </div>
        {gameState.phase === "gameOver" && (
          <div className="game-over-banner">
            Game Over!{" "}
            {gameState.players.friendly.roundWins > gameState.players.enemy.roundWins
              ? "Friendly Wins!"
              : gameState.players.enemy.roundWins > gameState.players.friendly.roundWins
                ? "Enemy Wins!"
                : "It's a Draw!"}
          </div>
        )}
      </div>

      <Hand cards={gameState.players.enemy.hand.map(card => ({
        name: card.baseCard.name, power: card.baseCard.basePower,
        provisionCost: card.baseCard.provisionCost, description: card.baseCard.description
      }))} title="Enemy Hand" />

      <Row
        cards={getRowCards("enemy", "ranged")}
        title="Enemy Ranged Row"
        rowData={gameState.players.enemy.rows.find(r => r.id === "ranged")}
      />
      <Row
        cards={getRowCards("enemy", "melee")}
        title="Enemy Melee Row"
        rowData={gameState.players.enemy.rows.find(r => r.id === "melee")}
      />
      <Row
        cards={getRowCards("friendly", "melee")}
        title="Friendly Melee Row"
        rowData={gameState.players.friendly.rows.find(r => r.id === "melee")}
      />
      <Row
        cards={getRowCards("friendly", "ranged")}
        title="Friendly Ranged Row"
        rowData={gameState.players.friendly.rows.find(r => r.id === "ranged")}
      />

      <Hand cards={gameState.players.friendly.hand.map(card => ({
        name: card.baseCard.name, power: card.baseCard.basePower,
        provisionCost: card.baseCard.provisionCost, description: card.baseCard.description
      }))} title="Friendly Hand" />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
