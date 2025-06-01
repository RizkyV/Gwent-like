import React from "react";
import { GameState } from "../core/types";
import { getPlayerPoints } from "../core/state";

export type InfoProps = {
    gameState: GameState;
};

export const GameInfo: React.FC<InfoProps> = ({ gameState }) => {
    return (
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
    );
};

export default GameInfo;