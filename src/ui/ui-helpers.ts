import { playCard, activateAbility, canActivateAbility, getGameState, getAllPossibleTargets, setCardController, getCurrentPlayer } from "../core/state";
import { uiStateStore } from "./game-controller";
import { CardInstance, EffectSource, HookType, PlayerRole, RowType } from "../core/types";
import { useTranslation } from "react-i18next";

export function handleCardDrop(card: CardInstance, rowType: RowType, player: PlayerRole, index: number) {
    const {
        setSelectedHandCard,
        setPendingAction,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();
    console.info(`handleCardDrop called with card=${card.baseCard.name}, rowType=${rowType}, player=${player}, index=${index}`);
    if (!card) return;
    setSelectedHandCard(card);
    setPendingAction({ type: "play", card, rowType, player, index });
    setUIPhase("playing");
    setPlayInitiator("user");
    handleRowDropConfirm();
}

export function handleRowDropConfirm() {
    // Called when the user confirms the row to play the card in
    const {
        pendingAction,
        setSelectedHandCard,
        setIsTargeting,
        setPendingAction,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();
    console.info(`handleRowDropConfirm called with pendingAction=${JSON.stringify(pendingAction)}`);
    if (!pendingAction || pendingAction.type !== "play") return;

    const card = pendingAction.card;
    const onPlayEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnPlay);
    if (onPlayEffect && onPlayEffect.validTargets) {
        if (hasValidTarget(onPlayEffect.validTargets, { kind: "card", card })) {
            setIsTargeting(true);
            setUIPhase("targeting");
        } else {
            console.info(`No valid targets for play effect on card ${card.baseCard.name}`);
            setSelectedHandCard(null);
            setIsTargeting(false);
            setPendingAction(null);
            setUIPhase("waiting");
            setPlayInitiator(null);
            playCard(card, pendingAction.player, pendingAction.rowType, pendingAction.index);
        }
    } else {
        setSelectedHandCard(null);
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
        setPlayInitiator(null);
        playCard(card, pendingAction.player, pendingAction.rowType, pendingAction.index);
    }

    setCardController(card, null); // Reset controller after playing
}

export function handleAbilityActivate(card: CardInstance) {
    const { setIsTargeting, setPendingAction, setUIPhase } = uiStateStore.getState();
    console.info(`handleAbilityActivate called for card=${card.baseCard.name}`);
    if (!canActivateAbility(card)) {
        console.warn('Cards ability was not ready to be activated')
        return;
    }
    const onAbilityEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnAbilityActivated);
    if (onAbilityEffect && onAbilityEffect.validTargets) {
        if (hasValidTarget(onAbilityEffect.validTargets, { kind: "card", card })) {
            setIsTargeting(true);
            setPendingAction({ type: "ability", card });
            setUIPhase("targeting");
        } else {
            console.info(`No valid targets for ability on card ${card.baseCard.name}`);
            setIsTargeting(false);
            setPendingAction(null);
            setUIPhase("waiting");
            activateAbility(card);
        }
    } else {
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
        activateAbility(card);
    }
}

// Accept effectSource and targetType for future extensibility
export function isValidTarget(target: EffectSource): boolean {
    const { isTargeting, pendingAction } = uiStateStore.getState();
    if (!isTargeting || !pendingAction) return false;

    // Card targeting
    if (pendingAction.type === "play" || pendingAction.type === "ability") {
        const effectSource = pendingAction.type === "play" ? pendingAction.card : pendingAction.card;
        const effect = effectSource.baseCard.effects?.find(
            e => (pendingAction.type === "play" ? e.hook === HookType.OnPlay : e.hook === HookType.OnAbilityActivated)
                && typeof e.validTargets === "function"
        );
        // Card target
        switch (target.kind) {
            case "card":
                return !!effect?.validTargets?.({ kind: "card", card: effectSource }, { kind: "card", card: target.card });
            case "row":
                return !!effect?.validTargets?.({ kind: "card", card: effectSource }, { kind: "row", row: target.row });
        }
        return false;
    }
}

export function hasValidTarget(validTargets: (source: EffectSource, target: EffectSource) => boolean, source: EffectSource): boolean {
    const targets = getAllPossibleTargets();
    for (const target of targets) {
        if (validTargets(source, target)) {
            return true;
        }
    }
    return false;
}


export function canPlayCard(): boolean {
    return getGameState().turn.hasPlayedCard !== true;
};

// Accept both card and row as target
export function handleTargetClick(target: EffectSource) {
    const {
        isTargeting,
        pendingAction,
        setSelectedHandCard,
        setIsTargeting,
        setPendingAction,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();
    if (!isTargeting || !pendingAction) return;

    if (pendingAction.type === "play") {
        playCard(
            pendingAction.card,
            pendingAction.player,
            pendingAction.rowType,
            pendingAction.index,
            target
        );
    } else if (pendingAction.type === "ability") {
        activateAbility(pendingAction.card, target);
    }
    setSelectedHandCard(null);
    setIsTargeting(false);
    setPendingAction(null);
    setUIPhase("waiting");
    setPlayInitiator(null);
}

export function cancelPlayIfAllowed() {
    const {
        uiPhase,
        playInitiator,
        setSelectedHandCard,
        setIsTargeting,
        setPendingAction,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();

    if ((uiPhase === "playing" || playInitiator === "user") || uiPhase === "targeting") {
        setSelectedHandCard(null);
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
        setPlayInitiator(null);
    }
}

export function setCardPlayingState(card: CardInstance) {
    const {
        setSelectedHandCard,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();
    console.log(`Setting card playing state for ${card.baseCard.name}`);
    setCardController(card, getCurrentPlayer());
    setSelectedHandCard(card);
    setUIPhase("playing");
    setPlayInitiator("engine");
}

/**
 * Localisation helpers
 */

export function getLocalizedPlayer(player: PlayerRole) {
    const { t } = useTranslation();
    return player === PlayerRole.Ivory ? t("game.ivory") : t("game.obsidian");
}

export function getLocalizedRowType(rowType: RowType) {
    const { t } = useTranslation();
    return rowType === RowType.Melee ? t("zones.melee") : t("zones.ranged");
}