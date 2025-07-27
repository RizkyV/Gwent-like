import React from "react";
import { GameState, PlayerRole } from "../core/types";
import { getPlayerPoints } from "../core/state";
import { useTranslation } from "react-i18next";
import { getLocalizedPlayer } from "./ui-helpers";

export type InfoProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
};

export const GameInfo: React.FC<InfoProps> = ({ gameState, localPlayer }) => {
    const { t } = useTranslation();
    return (
        <div className="game-info">
            <div>{t('game.currentRound')}: <strong>{gameState.currentRound}</strong></div>
            <div>{t('game.activePlayer')}: {getLocalizedPlayer(gameState.currentPlayer, t)}</div>
            <div>
                <span>{t('game.ivoryWins')}: <strong>{gameState.players.ivory.roundWins}</strong></span>
            </div>
            <div>
                <span>{t('game.obsidianWins')}: <strong>{gameState.players.obsidian.roundWins}</strong></span>
            </div>
            <div className="player-points">
                <div className="player-points__obsidian">
                    {t('game.obsidianPoints')}: <strong>{getPlayerPoints(gameState.players.obsidian)}</strong>
                </div>
                <div className="player-points__ivory">
                    {t('game.ivoryPoints')}: <strong>{getPlayerPoints(gameState.players.ivory)}</strong>
                </div>
            </div>
            {gameState.phase === "gameOver" && (
                <div className="game-over-banner">
                    {t('game.gameOver')}!{" "}
                    {gameState.players.ivory.roundWins > gameState.players.obsidian.roundWins
                        ? t('game.ivoryVictory')
                        : gameState.players.obsidian.roundWins > gameState.players.ivory.roundWins
                            ? t('game.obsidianVictory')
                            : t('game.tie')}
                </div>
            )}
        </div>
    );
};

export default GameInfo;