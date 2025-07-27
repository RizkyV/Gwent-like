import React, { useEffect, useState } from "react";
import GameBoard from "./game-board";
import { getCurrentPlayer, passTurn, subscribe } from "../core/state";
import { playerMadeMove } from "../controllers/uiPlayer";
import { CardInstance, EffectSource, GameState, PlayerRole, RowType } from "../core/types";
import { cancelPlayIfAllowed } from "./ui-helpers";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { runGame } from "../cli/main";
import { DEFAULT_LOCAL_PLAYER, LOCAL_PLAYER_CONTROLS_BOTH } from "../core/constants";
import { flipCoin } from "../core/helpers/utils";
import GameInfo from "./game-info";

export type uiState = {
    selectedHandCard: CardInstance | null;
    isTargeting: boolean;
    pendingAction: PendingAction | null;
    uiPhase: UIPhase;
    playInitiator: PlayInitiator | null;
    isUiActive: boolean;
    // Actions to update the state
    setSelectedHandCard: (card: CardInstance | null) => void;
    setIsTargeting: (isTargeting: boolean) => void;
    setPendingAction: (action: PendingAction | null) => void;
    setUIPhase: (phase: UIPhase) => void;
    setPlayInitiator: (initiator: PlayInitiator | null) => void;
    setState: (state: Partial<uiState>) => void;
};
export type UIPhase = "waiting" | "playing" | "targeting";
export type PlayInitiator = "user" | "engine";
export type PendingAction =
    | { type: "play"; card: CardInstance; rowType: RowType; player: PlayerRole; index: number }
    | { type: "ability"; card: CardInstance }
    | { type: "target"; effectSource: EffectSource };

export const uiStateStore = create<uiState>((set) => ({
    selectedHandCard: null,
    isTargeting: false,
    pendingAction: null,
    uiPhase: "waiting",
    playInitiator: null,
    isUiActive: true,
    setSelectedHandCard: (card) => set({ selectedHandCard: card }),
    setIsTargeting: (isTargeting) => set({ isTargeting }),
    setPendingAction: (action) => set({ pendingAction: action }),
    setUIPhase: (phase) => set({ uiPhase: phase }),
    setPlayInitiator: (initiator) => set({ playInitiator: initiator }),
    setState: (state) => set({ ...state }),
}));

type GameControllerProps = {
};

const GameController: React.FC<GameControllerProps> = () => {
    const [gameState, setGameState] = useState(null);
    const [localPlayer, setLocalPlayer] = useState<PlayerRole | null>(null);
    const { uiPhase, playInitiator, isUiActive } = uiStateStore();
    const { t } = useTranslation();

    useEffect(() => {
        //TODO: placeholder
        if (DEFAULT_LOCAL_PLAYER !== null) {
            setLocalPlayer(DEFAULT_LOCAL_PLAYER as PlayerRole);
        } else {
            flipCoin() ? setLocalPlayer(PlayerRole.Ivory) : setLocalPlayer(PlayerRole.Obsidian);
        }
        // Subscribe to state changes
        const unsubscribe = subscribe(setGameState);
        // Start the game
        runGame();
        // Cleanup on unmount
        return unsubscribe;
    }, []);
    // Update UI active state based on game state - if local player is controlling both, set UI active to true
/*     useEffect(() => {
        if (gameState) {
            console.log('currentPlayer', gameState.currentPlayer, 'localPlayer', localPlayer);
            console.log('isUiActive', LOCAL_PLAYER_CONTROLS_BOTH || gameState.currentPlayer === localPlayer);
            uiStateStore.setState({ isUiActive: LOCAL_PLAYER_CONTROLS_BOTH || gameState.currentPlayer === localPlayer });
        }
    }, [gameState]); */

    if (!gameState) return <div>{t('ui.loading')}</div>;

    const hasTakenAction = gameState.turn.hasPlayedCard || gameState.turn.hasActivatedAbility;
    const canCancel = (uiPhase === "playing" || playInitiator === "user") || uiPhase === "targeting";

    const handleEndOrPassTurn = () => {
        if(!isUiActive) {
            console.warn("Only the active player can end or pass the turn");
            return;
        }
        if (hasTakenAction) {
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        } else {
            passTurn(gameState.currentPlayer);
            if (gameState.GameConfig.controllers[gameState.currentPlayer].type === 'human') {
                playerMadeMove();
            }
        }
    };

    return (
        <>
            {false && <h1 className="app__title">GWENT-LIKE</h1>}
            {/*       <GlobalCancelOnContextMenu /> */}

            <GameInfo gameState={gameState} localPlayer={localPlayer} />
            <GameBoard gameState={gameState} localPlayer={localPlayer} />
            <button className="end-turn-btn" onClick={handleEndOrPassTurn}>
                {hasTakenAction ? t('actions.endTurn') : t('actions.passTurn')}
            </button>
            {canCancel && (
                <button
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 120,
                        zIndex: 3000,
                        background: "red",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: 8,
                        padding: "8px 16px",
                    }}
                    onClick={cancelPlayIfAllowed}
                >
                    {t('actions.cancel')}
                </button>
            )}
        </>
    );
};

export default GameController;

/* export const GlobalCancelOnContextMenu = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const { uiPhase } = uiStateStore.getState();
      console.log("Global contextmenu event fired", { phase: uiPhase });
      if (uiPhase === "playing") {
        e.preventDefault();
        cancelPlayIfAllowed();
      }
    };
    document.addEventListener("contextmenu", handler);
    return () => {
      document.removeEventListener("contextmenu", handler);
    };
  }, []);
  return null;
}; */