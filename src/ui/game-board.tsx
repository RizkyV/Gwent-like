import React from "react";
import { GameState } from "../core/types";
import Hand from "./hand";
import Row from "./row";

export type BoardProps = {
    gameState: GameState;
};

export const GameInfo: React.FC<BoardProps> = ({ gameState }) => {
    const getRowCards = (player: "friendly" | "enemy", rowId: "melee" | "ranged") => {
        const row = gameState.players[player].rows.find(r => r.id === rowId);
        return row.cards;
    };
    return (
        <>
            <Hand cards={gameState.players.enemy.hand} title="Enemy Hand" />

            <Row
                cards={getRowCards("enemy", "ranged")}
                title="Enemy Ranged Row"
                rowData={gameState.players.enemy.rows.find(r => r.id === "ranged")}
            />
            <Row
                cards={getRowCards("enemy", "melee")}
                title="Enemy Melee Row"
                rowData={gameState.players.enemy.rows.find(r => r.id === "melee")}
            />
            <Row
                cards={getRowCards("friendly", "melee")}
                title="Friendly Melee Row"
                rowData={gameState.players.friendly.rows.find(r => r.id === "melee")}
            />
            <Row
                cards={getRowCards("friendly", "ranged")}
                title="Friendly Ranged Row"
                rowData={gameState.players.friendly.rows.find(r => r.id === "ranged")}
            />

            <Hand cards={gameState.players.friendly.hand} title="Friendly Hand" />
        </>
    );
};

export default GameInfo;