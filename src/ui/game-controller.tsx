import React, { useState } from "react";
import GameBoard from "./game-board";
import { passTurn, playCard, activateAbility, canActivateAbility } from "../core/state";
import { CardInstance, GameState, PlayerRole, RowType, HookType } from "../core/types";
import { playerMadeMove } from "../controllers/uiPlayer";

type GameControllerProps = {
    gameState: GameState;
};

type PendingAction =
    | { type: "play"; card: CardInstance; rowType: RowType; player: PlayerRole; index: number }
    | { type: "ability"; card: CardInstance };

const GameController: React.FC<GameControllerProps> = ({ gameState }) => {
    const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
    const [targeting, setTargeting] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

    const hasTakenAction = gameState.turn.hasPlayedCard || gameState.turn.hasActivatedAbility;

    // Handler for dropping a card to play
    const handleCardDrop = (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => {
        if (!card) return;
        if (gameState.turn.hasPlayedCard) {
            console.warn('A card has already been played this turn');
            return;
        }
        const onPlayEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnPlay);
        if (onPlayEffect && onPlayEffect.validTargets) {
            setSelectedHandCard(card);
            setTargeting(true);
            setPendingAction({ type: "play", card, rowType, player, index });
        } else {
            playCard(card, gameState.currentPlayer, rowType, index);
            setSelectedHandCard(null);
            setTargeting(false);
            setPendingAction(null);
        }
    };

    // Handler for activating an ability on a board card
    const handleAbilityActivate = (card: CardInstance) => {
        if (!canActivateAbility(card)) {
            console.warn('Cards ability was not ready to be activated')
            return;
        }
        const onAbilityEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnAbilityActivated);
        if (onAbilityEffect && onAbilityEffect.validTargets) {
            setTargeting(true);
            setPendingAction({ type: "ability", card });
        } else {
            activateAbility(card);
            setTargeting(false);
            setPendingAction(null);
        }
    };

    // Handler for clicking a target on the board (for both play and ability)
    const handleBoardCardClick = (targetCard: CardInstance) => {
        if (!targeting || !pendingAction) return;

        if (pendingAction.type === "play") {
            playCard(
                pendingAction.card,
                pendingAction.player,
                pendingAction.rowType,
                pendingAction.index,
                targetCard
            );
        } else if (pendingAction.type === "ability") {
            activateAbility(pendingAction.card, targetCard);
        }

        setSelectedHandCard(null);
        setTargeting(false);
        setPendingAction(null);
    };

    // Helper to determine if a card is a valid target (for both play and ability)
    const isValidTarget = (card: CardInstance): boolean => {
        if (!targeting || !pendingAction) return false;

        if (pendingAction.type === "play") {
            const onPlayEffect = pendingAction.card.baseCard.effects?.find(
                e => e.hook === HookType.OnPlay && typeof e.validTargets === "function"
            );
            return !!onPlayEffect?.validTargets?.(pendingAction.card, { kind: "card", card });
        } else if (pendingAction.type === "ability") {
            const onAbilityEffect = pendingAction.card.baseCard.effects?.find(
                e => e.hook === HookType.OnAbilityActivated && typeof e.validTargets === "function"
            );
            return !!onAbilityEffect?.validTargets?.(pendingAction.card, { kind: "card", card });
        }
        return false;
    };

    // Handler for End Turn / Pass Turn button
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
            <GameBoard
                gameState={gameState}
                onCardDrop={handleCardDrop}
                onBoardCardClick={handleBoardCardClick}
                onAbilityActivate={handleAbilityActivate}
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