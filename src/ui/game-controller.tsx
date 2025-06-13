import React, { useState } from "react";
import GameBoard from "./game-board";
import { passTurn, playCard } from "../core/state";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import { playerMadeMove } from "../controllers/uiPlayer";

type GameControllerProps = {
    gameState: GameState;
};

const GameController: React.FC<GameControllerProps> = ({ gameState }) => {
    const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
    const [targeting, setTargeting] = useState(false);
    const [pendingPlacement, setPendingPlacement] = useState<{
        rowType: RowType;
        player: PlayerRole;
        index: number;
    } | null>(null);
    const hasTakenAction = gameState.turn.hasPlayedCard || gameState.turn.hasActivatedAbility;

    const handleCardDrop = (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => {
        if (!card) return;
        const onPlayEffect = card.baseCard.effects?.find(e => e.hook === "onPlay");
        if (onPlayEffect && onPlayEffect.validTargets) {
            setSelectedHandCard(card);
            setTargeting(true);
            setPendingPlacement({ rowType, player, index });
        } else {
            playCard(card, gameState.currentPlayer, rowType, index);
            setSelectedHandCard(null);
            setTargeting(false);
        }
    };

    // Handler for clicking a card in hand - TODO: REMOVE
    const handleHandCardClick = (card: CardInstance) => {
        const onPlayEffect = card.baseCard.effects?.find(e => e.hook === "onPlay");
        if (onPlayEffect && onPlayEffect.validTargets) {
            setSelectedHandCard(card);
            setTargeting(true);
        } else {
            playCard(card, gameState.currentPlayer, RowType.Ranged, 0);
            setSelectedHandCard(null);
            setTargeting(false);
        }
    };

    // Handler for clicking a target on the board
    const handleBoardCardClick = (targetCard: CardInstance) => {
        console.log("Card clicked (Board):", targetCard);
        if (targeting && selectedHandCard) {
            playCard(selectedHandCard, pendingPlacement.player, pendingPlacement.rowType, pendingPlacement.index, targetCard);
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
        if (hasTakenAction) {
            // Action taken, end turn
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        } else {
            // No action taken, pass turn
            passTurn(gameState.currentPlayer);
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        }
    };

    return (
        <div>
            <GameBoard
                gameState={gameState}
                onCardDrop={handleCardDrop}
                onHandCardClick={handleHandCardClick}
                onBoardCardClick={handleBoardCardClick}
                selectedHandCard={selectedHandCard}
                isTargeting={targeting}
                isValidTarget={isValidTarget}
            />
            <button className="end-turn-btn" onClick={handleEndOrPassTurn}>
                {hasTakenAction ? "End Turn" : "Pass Turn"}
            </button>
        </div>
    );
};

export default GameController;