import React from "react";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import Hand from "./hand";
import Row from "./row";

export type BoardProps = {
    gameState: GameState;
    onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
    onHandCardClick: (card: CardInstance) => void;
    onBoardCardClick: (card: CardInstance) => void;
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    isValidTarget: (card: CardInstance) => boolean;
};

export const GameInfo: React.FC<BoardProps> = ({
    gameState,
    onCardDrop,
    onHandCardClick,
    onBoardCardClick,
    selectedHandCard,
    isTargeting,
    isValidTarget
}) => {

    return (
        <>
            <Hand
                cards={gameState.players.enemy.hand}
                onCardClick={onHandCardClick}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                canPlay={false}
                title="Enemy Hand" />

            <Row
                row={gameState.players.enemy.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.enemy.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.friendly.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.friendly.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            <Hand
                cards={gameState.players.friendly.hand}
                onCardClick={onHandCardClick}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                canPlay={gameState.currentPlayer === 'friendly' && !gameState.turn.hasPlayedCard}
                title="Friendly Hand" />
        </>
    );
};

export default GameInfo;