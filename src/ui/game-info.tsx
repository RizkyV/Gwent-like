import React from "react";
import { GameState, PlayerRole } from "../core/types";
import { getPlayerPoints } from "../core/state";
import { useTranslation } from "react-i18next";

export type InfoProps = {
    gameState: GameState;
    role: PlayerRole | null;
};

export const GameInfo: React.FC<InfoProps> = ({ gameState }) => {
    const { t } = useTranslation();
    return (
        <div className="game-info">
            <div>{t('game.currentRound')}: <strong>{gameState.currentRound}</strong></div>
            <div>{t('game.activePlayer')}: {gameState.currentPlayer === "white" ? t('game.white') : t('game.black')}</div>
            <div>
                <span>{t('game.whiteWins')}: <strong>{gameState.players.white.roundWins}</strong></span>
            </div>
            <div>
                <span>{t('game.blackWins')}: <strong>{gameState.players.black.roundWins}</strong></span>
            </div>
            <div className="player-points">
                <div className="player-points__black">
                    Black Total Points: <strong>{getPlayerPoints(gameState.players.black)}</strong>
                </div>
                <div className="player-points__white">
                    White Total Points: <strong>{getPlayerPoints(gameState.players.white)}</strong>
                </div>
            </div>
            {gameState.phase === "gameOver" && (
                <div className="game-over-banner">
                    Game Over!{" "}
                    {gameState.players.white.roundWins > gameState.players.black.roundWins
                        ? "White Wins!"
                        : gameState.players.black.roundWins > gameState.players.white.roundWins
                            ? "Black Wins!"
                            : "It's a Draw!"}
                </div>
            )}
        </div>
    );
};

export default GameInfo;