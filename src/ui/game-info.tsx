import React from "react";
import { GameState } from "../core/types";
import { getPlayerPoints } from "../core/state";
import { useTranslation } from "react-i18next";

export type InfoProps = {
    gameState: GameState;
};

export const GameInfo: React.FC<InfoProps> = ({ gameState }) => {
    const { t } = useTranslation();
    return (
        <div className="game-info">
            <div>{t('game.currentRound')}: <strong>{gameState.currentRound}</strong></div>
            <div>{t('game.activePlayer')}: {gameState.currentPlayer === "friendly" ? t('game.friendly') : t('game.enemy')}</div>
            <div>
                <span>{t('game.friendlyWins')}: <strong>{gameState.players.friendly.roundWins}</strong></span>
            </div>
            <div>
                <span>{t('game.enemyWins')}: <strong>{gameState.players.enemy.roundWins}</strong></span>
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