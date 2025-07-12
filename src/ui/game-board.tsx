import React from "react";
import { GameState, PlayerRole, RowType, Zone } from "../core/types";
import Hand from "./hand";
import Row from "./row";
import { ZonePreview } from "./zone-preview";
import { getOtherPlayer } from "../core/helpers/player";

export type BoardProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
};

const GameBoard: React.FC<BoardProps> = ({ gameState, localPlayer }) => {
    return (
        <>
            {/* opponent zones */}
            <ZonePreview
                title={`${getOtherPlayer(localPlayer)} Deck`}
                zone={Zone.Deck}
                cards={gameState.players[getOtherPlayer(localPlayer)].deck}
                position={{ top: 16, right: 16 }}
            />
            <ZonePreview
                title={`${getOtherPlayer(localPlayer)} Graveyard`}
                zone={Zone.Graveyard}
                cards={gameState.players[getOtherPlayer(localPlayer)].graveyard}
                position={{ top: 16, left: 16 }}
            />

            {/* opponent hand and rows */}
            <Hand
                cards={gameState.players[getOtherPlayer(localPlayer)].hand}
                title={`${getOtherPlayer(localPlayer)} Hand`}
            />
            <Row row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Ranged)} />
            <Row row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Melee)} />

            {/* local rows and hand */}
            <Row row={gameState.players[localPlayer].rows.find(r => r.type === RowType.Melee)} />
            <Row row={gameState.players[localPlayer].rows.find(r => r.type === RowType.Ranged)} />
            <Hand
                cards={gameState.players[localPlayer].hand}
                title={`${localPlayer} Hand`}
            />

            {/* local zones */}
            <ZonePreview
                title={`${localPlayer} Deck`}
                zone={Zone.Deck}
                cards={gameState.players[localPlayer].deck}
                position={{ bottom: 16, right: 16 }}
            />
            <ZonePreview
                title={`${localPlayer} Graveyard`}
                zone={Zone.Graveyard}
                cards={gameState.players[localPlayer].graveyard}
                position={{ bottom: 16, left: 16 }}
            />
        </>
    );
};

export default GameBoard;