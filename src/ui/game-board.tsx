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
    const getRowCards = (player: PlayerRole, rowId: "melee" | "ranged") => {
        const row = gameState.players[player].rows.find(r => r.id === rowId);
        return row.cards;
    };
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
                cards={getRowCards("enemy", "ranged")}
                player="enemy"
                rowData={gameState.players.enemy.rows.find(r => r.id === "ranged")}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("enemy", "melee")}
                player="enemy"
                rowData={gameState.players.enemy.rows.find(r => r.id === "melee")}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("friendly", "melee")}
                player="friendly"
                rowData={gameState.players.friendly.rows.find(r => r.id === "melee")}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("friendly", "ranged")}
                player="friendly"
                rowData={gameState.players.friendly.rows.find(r => r.id === "ranged")}
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