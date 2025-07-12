import React from "react";
import GameBoard from "./game-board";
import { passTurn } from "../core/state";
import { playerMadeMove } from "../controllers/uiPlayer";
import { uiStateStore } from "./index";
import { GameState, PlayerRole } from "../core/types";
import { cancelPlayIfAllowed } from "./ui-helpers";
import { useTranslation } from "react-i18next";

type GameControllerProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
};

const GameController: React.FC<GameControllerProps> = ({ gameState, localPlayer }) => {
    const { uiPhase, playInitiator } = uiStateStore();
    const { t } = useTranslation();

    const hasTakenAction = gameState.turn.hasPlayedCard || gameState.turn.hasActivatedAbility;

    const handleEndOrPassTurn = () => {
        if (hasTakenAction) {
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        } else {
            passTurn(gameState.currentPlayer);
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        }
    };

    return (
        <div>
            <GameBoard gameState={gameState} localPlayer={localPlayer} />
            <button className="end-turn-btn" onClick={handleEndOrPassTurn}>
                {hasTakenAction ? t('actions.endTurn') : t('actions.passTurn')}
            </button>
            {uiPhase === "playing" && playInitiator === "user" && (
                <button
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 120,
                        zIndex: 3000,
                        background: "red",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: 8,
                        padding: "8px 16px",
                    }}
                    onClick={cancelPlayIfAllowed}
                >
                    {t('actions.cancel')}
                </button>
            )}
        </div>
    );
};

export default GameController;