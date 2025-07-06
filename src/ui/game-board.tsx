import React from "react";
import { CardInstance, GameState, PlayerRole, RowType } from "../core/types";
import Hand from "./hand";
import Row from "./row";
import { ZonePreview } from "./zone-preview";
import { getOtherPlayer } from "../core/helpers/player";

export type BoardProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
    onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
    onBoardCardClick: (card: CardInstance) => void;
    onAbilityActivate: (card: CardInstance) => void;
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    isValidTarget: (card: CardInstance) => boolean;
};

export const GameInfo: React.FC<BoardProps> = ({
    gameState,
    localPlayer,
    onCardDrop,
    onBoardCardClick,
    onAbilityActivate,
    selectedHandCard,
    isTargeting,
    isValidTarget
}) => {

    return (
        <>
            {/* opponent zones */}
            <ZonePreview
                title={`${getOtherPlayer(localPlayer)} Deck`}
                cards={gameState.players[getOtherPlayer(localPlayer)].deck}
                position={{ top: 16, right: 16 }}
            />
            <ZonePreview
                title={`${getOtherPlayer(localPlayer)} Graveyard`}
                cards={gameState.players[getOtherPlayer(localPlayer)].graveyard}
                position={{ top: 16, left: 16 }}
            />

            {/* opponent hand and rows */}
            <Hand
                cards={gameState.players[getOtherPlayer(localPlayer)].hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title={`${getOtherPlayer(localPlayer)} Hand`} />

            <Row
                row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            {/* local rows and hand */}
            <Row
                row={gameState.players[localPlayer].rows.find(r => r.type === RowType.Melee)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />
            <Row
                row={gameState.players[localPlayer].rows.find(r => r.type === RowType.Ranged)}
                onCardDrop={onCardDrop}
                onCardClick={onBoardCardClick}
                onAbilityActivate={onAbilityActivate}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
            />

            <Hand
                cards={gameState.players[localPlayer].hand}
                selectedCard={selectedHandCard}
                isTargeting={isTargeting}
                isValidTarget={isValidTarget}
                title={`${localPlayer} Hand`} />

            {/* local zones */}
            <ZonePreview
                title={`${localPlayer} Deck`}
                cards={gameState.players[localPlayer].deck}
                position={{ bottom: 16, right: 16 }}
            />
            <ZonePreview
                title={`${localPlayer} Graveyard`}
                cards={gameState.players[localPlayer].graveyard}
                position={{ bottom: 16, left: 16 }}
            />
        </>
    );
};

export default GameInfo;