import React from "react";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import Hand from "./hand";
import Row from "./row";
import { ZonePreview } from "./zone-preview";
import { getOtherPlayer } from "../core/helpers/player";

export type BoardProps = {
    gameState: GameState;
    role: PlayerRole | null;
    onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
    onBoardCardClick: (card: CardInstance) => void;
    onAbilityActivate: (card: CardInstance) => void;
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    isValidTarget: (card: CardInstance) => boolean;
};

export const GameInfo: React.FC<BoardProps> = ({
    gameState,
    role,
    onCardDrop,
    onBoardCardClick,
    onAbilityActivate,
    selectedHandCard,
    isTargeting,
    isValidTarget
}) => {

    return (
        <>
            {/* non-Active zones */}
            <ZonePreview
                title={`${getOtherPlayer(role)} Deck`}
                cards={gameState.players[getOtherPlayer(role)].deck}
                position={{ top: 16, right: 16 }}
            />
            <ZonePreview
                title={`${getOtherPlayer(role)} Graveyard`}
                cards={gameState.players[getOtherPlayer(role)].graveyard}
                position={{ top: 16, left: 16 }}
            />

            {/* non-Active hand and rows */}
            <Hand
                cards={gameState.players[getOtherPlayer(role)].hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title={`${getOtherPlayer(role)} Hand`} />

            <Row
                row={gameState.players[getOtherPlayer(role)].rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players[getOtherPlayer(role)].rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            {/* Active rows and hand */}
            <Row
                row={gameState.players[role].rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players[role].rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            <Hand
                cards={gameState.players[role].hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title={`${role} Hand`} />

            {/* Active zones */}
            <ZonePreview
                title={`${role} Deck`}
                cards={gameState.players[role].deck}
                position={{ bottom: 16, right: 16 }}
            />
            <ZonePreview
                title={`${role} Graveyard`}
                cards={gameState.players[role].graveyard}
                position={{ bottom: 16, left: 16 }}
            />
        </>
    );
};

export default GameInfo;