import { playCard, activateAbility, canActivateAbility, getGameState } from "../core/state";
import { uiStateStore } from "./index";
import { CardInstance, EffectSource, HookType, PlayerRole, RowType } from "../core/types";
import { useTranslation } from "react-i18next";

export function handleCardDrop(card: CardInstance, rowType: RowType, player: PlayerRole, index: number) {
    const {
        setSelectedHandCard,
        setIsTargeting,
        setPendingAction,
        setUIPhase,
        setPlayInitiator,
    } = uiStateStore.getState();

    if (!card) return;
    //TODO: getCurrentPlayer state helper
    if (getGameState().turn.hasPlayedCard) {
        console.warn('A card has already been played this turn');
        return;
    }
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

    //TODO: getCurrentPlayer state helper
    if (getGameState().turn.hasPlayedCard) {
        console.warn('A card has already been played this turn');
        return;
    }
    if (!pendingAction || pendingAction.type !== "play") return;

    const card = pendingAction.card;
    const onPlayEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnPlay);

    if (onPlayEffect && onPlayEffect.validTargets) {
        setIsTargeting(true);
        setUIPhase("targeting");
    } else {
        playCard(card, pendingAction.player, pendingAction.rowType, pendingAction.index);
        setSelectedHandCard(null);
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
        setPlayInitiator(null);

    }
}

export function handleAbilityActivate(card: CardInstance) {
    const { setIsTargeting, setPendingAction, setUIPhase } = uiStateStore.getState();
    if (!canActivateAbility(card)) {
        console.warn('Cards ability was not ready to be activated')
        return;
    }
    const onAbilityEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnAbilityActivated);
    if (onAbilityEffect && onAbilityEffect.validTargets) {
        setIsTargeting(true);
        setPendingAction({ type: "ability", card });
        setUIPhase("targeting");
    } else {
        activateAbility(card);
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
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
                return !!effect?.validTargets?.(effectSource, { kind: "card", card: target.card });
            case "row":
                return !!effect?.validTargets?.(effectSource, { kind: "row", row: target.row });
        }
        return false;
    }
}

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

    if (uiPhase === "playing" && playInitiator === "user") {
        setSelectedHandCard(null);
        setIsTargeting(false);
        setPendingAction(null);
        setUIPhase("waiting");
        setPlayInitiator(null);
    }
}

export function initiateCardPlaying(card: CardInstance) {
    uiStateStore.getState().setSelectedHandCard(card);
    uiStateStore.getState().setUIPhase("playing");
    uiStateStore.getState().setPlayInitiator("engine");
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