import React from "react";
import GameBoard from "./game-board";
import { passTurn } from "../core/state";
import { playerMadeMove } from "../controllers/uiPlayer";
import { uiStateStore } from "./index";
import { GameState, PlayerRole } from "../core/types";

type GameControllerProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
};

const GameController: React.FC<GameControllerProps> = ({ gameState, localPlayer }) => {
    const { isTargeting } = uiStateStore();
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
                {hasTakenAction ? "End Turn" : "Pass Turn"}
            </button>
        </div>
    );
};

export default GameController;