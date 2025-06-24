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
            {/* Enemy zones */}
            <ZonePreview
                title="Enemy Deck"
                cards={gameState.players.enemy.deck}
                position={{ top: 16, right: 16 }}
            />
            <ZonePreview
                title="Enemy Graveyard"
                cards={gameState.players.enemy.graveyard}
                position={{ top: 16, left: 16 }}
            />

            {/* Enemy hand and rows */}
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

            {/* Friendly rows and hand */}
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

            {/* Friendly zones */}
            <ZonePreview
                title="Friendly Deck"
                cards={gameState.players.friendly.deck}
                position={{ bottom: 16, right: 16 }}
            />
            <ZonePreview
                title="Friendly Graveyard"
                cards={gameState.players.friendly.graveyard}
                position={{ bottom: 16, left: 16 }}
            />
        </>
    );
};

export default GameInfo;