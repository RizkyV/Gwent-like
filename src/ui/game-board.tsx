import React from "react";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import Hand from "./hand";
import Row from "./row";
import { ZonePreview } from "./zone-preview";

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
            {/* Black zones */}
            <ZonePreview
                title="Black Deck"
                cards={gameState.players.black.deck}
                position={{ top: 16, right: 16 }}
            />
            <ZonePreview
                title="Black Graveyard"
                cards={gameState.players.black.graveyard}
                position={{ top: 16, left: 16 }}
            />

            {/* Black hand and rows */}
            <Hand
                cards={gameState.players.black.hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title="Black Hand" />

            <Row
                row={gameState.players.black.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.black.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            {/* White rows and hand */}
            <Row
                row={gameState.players.white.rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players.white.rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            <Hand
                cards={gameState.players.white.hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title="White Hand" />

            {/* White zones */}
            <ZonePreview
                title="White Deck"
                cards={gameState.players.white.deck}
                position={{ bottom: 16, right: 16 }}
            />
            <ZonePreview
                title="White Graveyard"
                cards={gameState.players.white.graveyard}
                position={{ bottom: 16, left: 16 }}
            />
        </>
    );
};

export default GameInfo;