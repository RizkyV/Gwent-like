import React from "react";
import { GameState, PlayerRole, RowType, Zone } from "../core/types";
import Hand from "./hand";
import Row from "./row";
import { ZonePreview } from "./zone-preview";
import { getOtherPlayer } from "../core/helpers/player";
import HandCard from "./hand-card";
import GameInfo from "./game-info";

export type BoardProps = {
    gameState: GameState;
    localPlayer: PlayerRole | null;
};

const GameBoard: React.FC<BoardProps> = ({ gameState, localPlayer }) => {
    const ivoryLeader = gameState.players.ivory.leader;
    const obsidianLeader = gameState.players.obsidian.leader;

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

            {/* opponent hand, leader and rows */}
            <Hand
                cards={gameState.players[getOtherPlayer(localPlayer)].hand}
                title={`${getOtherPlayer(localPlayer)} Hand`}
            />
            <div
                className={`leader-card leader-card--opponent`}
            >
                <HandCard
                    card={gameState.players[getOtherPlayer(localPlayer)].leader}
                    highlight={false}
                    allowDragging={false}
                />
            </div>
            <Row row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Ranged)} />
            <Row row={gameState.players[getOtherPlayer(localPlayer)].rows.find(r => r.type === RowType.Melee)} />

            {/* local hand, leader and rows */}
            <div
                className={`leader-card leader-card--local`}
            >
                <HandCard
                    card={gameState.players[localPlayer].leader}
                    highlight={false}
                    allowDragging={false}
                />
            </div>
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