import React from "react";
import { CardInstance, GameState } from "../core/types";
import Hand from "./hand";
import Row from "./row";

export type BoardProps = {
    gameState: GameState;
    onHandCardClick: (card: CardInstance) => void;
    onBoardCardClick: (card: CardInstance) => void;
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    isValidTarget: (card: CardInstance) => boolean;
};

export const GameInfo: React.FC<BoardProps> = ({
    gameState,
    onHandCardClick,
    onBoardCardClick,
    selectedHandCard,
    isTargeting,
    isValidTarget
}) => {
    const getRowCards = (player: "friendly" | "enemy", rowId: "melee" | "ranged") => {
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
                title="Enemy Ranged Row"
                rowData={gameState.players.enemy.rows.find(r => r.id === "ranged")}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("enemy", "melee")}
                title="Enemy Melee Row"
                rowData={gameState.players.enemy.rows.find(r => r.id === "melee")}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("friendly", "melee")}
                title="Friendly Melee Row"
                rowData={gameState.players.friendly.rows.find(r => r.id === "melee")}
                onCardClick={onBoardCardClick}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                cards={getRowCards("friendly", "ranged")}
                title="Friendly Ranged Row"
                rowData={gameState.players.friendly.rows.find(r => r.id === "ranged")}
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