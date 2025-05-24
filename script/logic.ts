function createCardInstance(def: CardDefinition): CardInstance {
    return {
        instanceId: crypto.randomUUID(), // or your UUID generator
        baseCard: def,
        currentPower: def.basePower,
        statuses: new Set<StatusId>(),
    };
}

function resolveCardPlay(card: CardInstance, state: GameState, player: PlayerRole): GameState {
    const effect = card.baseCard.effects?.find(e => e.hook === 'onPlay')?.effect;
    if (!effect) return state;
    return effect(state, { source: card, player });
}
console.log(cardDefinitions);
console.log(createCardInstance(cardDefinitions[0]));

/*
 * Core gameplay hooks for effect system
 * - onPlay: when a card is played from hand
 * - onTargeted: when a card becomes the target of an effect or ability
 * - onTurnStart: start of a player's turn (e.g., for ticking effects like poison)
 * - onTurnEnd: end of a player's turn (cleanup, temporary effect expiration)
 * - onDamaged: when a card takes damage (used for reactions, enrage, armor)
 * - onDeath: when a card dies and leaves the board
 * - onSummoned: when a card enters play (includes summoned or spawned units)
 * - onDraw: when a card is drawn from the deck
 * - onDiscard: when a card is discarded from hand
 * - onGraveyardEnter: when a card enters the graveyard (includes death or discard)
 * - onMoveToRow: when a card moves between rows (e.g., melee to ranged)
 * - onRoundStart: start of a round (reset or initialize round effects)
 * - onRoundEnd: end of a round (clear or trigger round-end logic)
 * - onAbilityActivated: when a card's active ability is used (e.g., once-per-turn)
*/

/*
 * TODO:
 * - function that builds start game state
 * - deck handling
 * - hand handling
 * - draw
*/


/*
* Helpers
*/
function getRows(state: GameState, player: PlayerRole): Row[] {
    return player === 'friendly' ? state.players.friendly.rows : state.players.enemy.rows;
}
function setRows(state: GameState, player: PlayerRole, rows: Row[]): GameState {
    return {
        ...state,
        ...(player === 'friendly'
            ? { friendlyRows: rows }
            : { enemyRows: rows })
    };
}
function getRowById(rows: Row[], id: 'melee' | 'ranged'): Row | undefined {
    return rows.find(row => row.id === id);
}

function addStatus(card: CardInstance, status: StatusId): CardInstance {
    const newStatuses = new Set(card.statuses);
    newStatuses.add(status);
    return { ...card, statuses: newStatuses };
}

function removeStatus(card: CardInstance, status: StatusId): CardInstance {
    const newStatuses = new Set(card.statuses);
    newStatuses.delete(status);
    return { ...card, statuses: newStatuses };
}

function hasStatus(card: CardInstance, status: StatusId): boolean {
    return card.statuses.has(status);
}

function canTargetCard(card: CardInstance, state: GameState): boolean {
    for (const status of Array.from(card.statuses)) {
        const effect = statusEffects[status];
        if (effect?.canBeTargeted && !effect.canBeTargeted(card, state)) {
            return false; // one status disallows targeting
        }
    }
    return true; // no status disallows targeting
}

function triggerHook(
  hook: HookType,
  state: GameState,
  context: EffectContext
): GameState {
  let newState = state;

  // Helper to get all CardInstances in play
  const allCards = [...state.players.friendly.rows, ...state.players.enemy.rows].flatMap(row => row.cards);

  for (const card of allCards) {
    const hookedEffects = card.baseCard.effects?.filter(e => e.hook === hook) || [];

    for (const { effect } of hookedEffects) {
      const scopedContext: EffectContext = {
        ...context,
        source: card,
        player: card.baseCard.isToken ? context.player : getCardOwner(state, card),
      };
      newState = effect(newState, scopedContext);
    }
  }

  return newState;
}

function getCardOwner(state: GameState, card: CardInstance): PlayerRole {
  const cardId = card.instanceId;

  const friendlyHasCard = state.players.friendly.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );

  if (friendlyHasCard) return 'friendly';

  const enemyHasCard = state.players.enemy.rows.some(row =>
    row.cards.some(c => c.instanceId === cardId)
  );

  if (enemyHasCard) return 'enemy';

  throw new Error(`Could not determine owner of card with instanceId: ${cardId}`);
}

function updateCardInState(
  state: GameState,
  cardId: string,
  updater: (card: CardInstance) => CardInstance
): GameState {
  const updateRows = (rows: Row[]): Row[] =>
    rows.map(row => ({
      ...row,
      cards: row.cards.map(card =>
        card.instanceId === cardId ? updater(card) : card
      )
    }));

  // Try friendly player
  const updatedFriendlyRows = updateRows(state.players.friendly.rows);
  const foundInFriendly = updatedFriendlyRows.some((r, i) =>
    r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.friendly.rows[i].cards[j])
  );

  if (foundInFriendly) {
    return {
      ...state,
      players: {
        ...state.players,
        friendly: {
          ...state.players.friendly,
          rows: updatedFriendlyRows
        }
      }
    };
  }

  // Try enemy player
  const updatedEnemyRows = updateRows(state.players.enemy.rows);
  const foundInEnemy = updatedEnemyRows.some((r, i) =>
    r.cards.some((c, j) => c.instanceId === cardId && c !== state.players.enemy.rows[i].cards[j])
  );

  if (foundInEnemy) {
    return {
      ...state,
      players: {
        ...state.players,
        enemy: {
          ...state.players.enemy,
          rows: updatedEnemyRows
        }
      }
    };
  }

  throw new Error(`Card with instanceId ${cardId} not found in any player's rows.`);
}