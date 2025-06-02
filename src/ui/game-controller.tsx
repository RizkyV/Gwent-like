import React, { useState } from "react";
import GameBoard from "./game-board";
import { passTurn, playCard } from "../core/state";
import { CardInstance, GameState } from "../core/types";
import { playerEndTurn } from "../controllers/uiPlayer";

type GameControllerProps = {
    gameState: GameState;
};

const GameController: React.FC<GameControllerProps> = ({ gameState }) => {
    const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
    const [targeting, setTargeting] = useState(false);

    // Handler for clicking a card in hand
    const handleHandCardClick = (card: CardInstance) => {
        console.log("Card clicked (Hand):", card);
        if (card.baseCard.requiresTarget) {
            setSelectedHandCard(card);
            setTargeting(true);
        } else {
            playCard(card, gameState.currentPlayer);
            setSelectedHandCard(null);
            setTargeting(false);
        }
    };

    // Handler for clicking a target on the board
    const handleBoardCardClick = (targetCard: CardInstance) => {
        console.log("Card clicked (Board):", targetCard);
        if (targeting && selectedHandCard) {
            playCard(selectedHandCard, gameState.currentPlayer, targetCard);
            setSelectedHandCard(null);
            setTargeting(false);
        }
    };

    // Helper to determine if a card is a valid target
    const isValidTarget = (card: CardInstance): boolean => {
        if (!targeting || !selectedHandCard) return false;
        const onPlayEffect = selectedHandCard.baseCard.effects?.find(e => e.hook === "onPlay" && typeof e.validTargets === "function");
        if (onPlayEffect && typeof onPlayEffect.validTargets === "function") {
            return onPlayEffect.validTargets(selectedHandCard, card);
        } else {
            return false;
        }
    };

    // Handler for End Turn / Pass Turn button
    const handleEndOrPassTurn = () => {
        if (!gameState.turn.hasPlayedCard && !gameState.turn.hasActivatedAbility) {
            // No action taken, pass turn
            passTurn(gameState.currentPlayer);
            playerEndTurn();
        } else {
            // Action taken, end turn and notify uiPlayerMove
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerEndTurn();
            }
        }
    };

    return (
        <div>
            <GameBoard
                gameState={gameState}
                onHandCardClick={handleHandCardClick}
                onBoardCardClick={handleBoardCardClick}
                selectedHandCard={selectedHandCard}
                isTargeting={targeting}
                isValidTarget={isValidTarget}
            />
            <button className="end-turn-btn" onClick={handleEndOrPassTurn}>
                {(!gameState.turn.hasPlayedCard && !gameState.turn.hasActivatedAbility) ? "Pass Turn" : "End Turn"}
            </button>
        </div>
    );
};

export default GameController;