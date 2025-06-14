import React from "react";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import Hand from "./hand";
import Row from "./row";

export type BoardProps = {
    gameState: GameState;
    onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
    onBoardCardClick: (card: CardInstance) => void;
    onAbilityActivate: (card: CardInstance) => void;
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    isValidTarget: (card: CardInstance) => boolean;
};

export const GameInfo: React.FC<BoardProps> = ({
    gameState,
    onCardDrop,
    onBoardCardClick,
    onAbilityActivate,
    selectedHandCard,
    isTargeting,
    isValidTarget
}) => {

    return (
        <>
            <Hand
                cards={gameState.players.enemy.hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title="Enemy Hand" />

            <Row
                row={gameState.players.enemy.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.enemy.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.friendly.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.friendly.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            <Hand
                cards={gameState.players.friendly.hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title="Friendly Hand" />
        </>
    );
};

export default GameInfo;