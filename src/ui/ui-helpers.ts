import { playCard, activateAbility, canActivateAbility, getGameState } from "../core/state";
import { uiStateStore } from "./index";
import { CardInstance, HookType, PlayerRole, RowType } from "../core/types";

export function handleCardDrop(card: CardInstance, rowType: RowType, player: PlayerRole, index: number) {
    const { setSelectedHandCard, setIsTargeting, setPendingAction } = uiStateStore.getState();
    if (!card) return;
    //TODO: getCurrentPlayer state helper
    if (getGameState().turn.hasPlayedCard) {
        console.warn('A card has already been played this turn');
        return;
    }
    const onPlayEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnPlay);
    if (onPlayEffect && onPlayEffect.validTargets) {
        setSelectedHandCard(card);
        setIsTargeting(true);
        setPendingAction({ type: "play", card, rowType, player, index });
    } else {
        playCard(card, getGameState().currentPlayer, rowType, index);
        setSelectedHandCard(null);
        setIsTargeting(false);
        setPendingAction(null);
    }
}

export function handleAbilityActivate(card: CardInstance) {
    const { setIsTargeting, setPendingAction } = uiStateStore.getState();
    if (!canActivateAbility(card)) {
        console.warn('Cards ability was not ready to be activated')
        return;
    }
    const onAbilityEffect = card.baseCard.effects?.find(e => e.hook === HookType.OnAbilityActivated);
    if (onAbilityEffect && onAbilityEffect.validTargets) {
        setIsTargeting(true);
        setPendingAction({ type: "ability", card });
    } else {
        activateAbility(card);
        setIsTargeting(false);
        setPendingAction(null);
    }
}

export function handleBoardCardClick(targetCard: CardInstance) {
    const { isTargeting, pendingAction, setSelectedHandCard, setIsTargeting, setPendingAction } = uiStateStore.getState();
    if (!isTargeting || !pendingAction) return;

    if (pendingAction.type === "play") {
        playCard(
            pendingAction.card,
            pendingAction.player,
            pendingAction.rowType,
            pendingAction.index,
            targetCard
        );
    } else if (pendingAction.type === "ability") {
        activateAbility(pendingAction.card, targetCard);
    }

    setSelectedHandCard(null);
    setIsTargeting(false);
    setPendingAction(null);
}

export function isValidTarget(card: CardInstance) {
    const { isTargeting, pendingAction } = uiStateStore.getState();
    if (!isTargeting || !pendingAction) return false;

    if (pendingAction.type === "play") {
        const onPlayEffect = pendingAction.card.baseCard.effects?.find(
            e => e.hook === HookType.OnPlay && typeof e.validTargets === "function"
        );
        return !!onPlayEffect?.validTargets?.(pendingAction.card, { kind: "card", card });
    } else if (pendingAction.type === "ability") {
        const onAbilityEffect = pendingAction.card.baseCard.effects?.find(
            e => e.hook === HookType.OnAbilityActivated && typeof e.validTargets === "function"
        );
        return !!onAbilityEffect?.validTargets?.(pendingAction.card, { kind: "card", card });
    }
    return false;
}