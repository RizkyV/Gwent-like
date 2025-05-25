//Gameplay logic
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

function createInitialGameState(friendlyDeck: CardInstance[], enemyDeck: CardInstance[]): GameState {
  return {
    players: {
      friendly: {
        hand: [],
        deck: [...friendlyDeck],
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      },
      enemy: {
        hand: [],
        deck: [...enemyDeck],
        graveyard: [],
        rows: [
          { id: 'melee', cards: [] },
          { id: 'ranged', cards: [] }
        ],
        passed: false,
        roundWins: 0
      }
    },
    currentPlayer: 'friendly',
    currentRound: 1,
    phase: 'draw',
    turn: {
      hasActivatedAbility: false,
      hasPlayedCard: false
    }
  };
}

function startRound(state: GameState): GameState {
  let newState = state;
  newState = drawCards(newState, 'friendly', 10);
  newState = drawCards(newState, 'enemy', 10);
  return {
    ...newState,
    phase: 'play',
    currentPlayer: flipCoin ? 'friendly' : 'enemy' // the one that lost last
  };
}

function checkEndOfRound(state: GameState): GameState {
  const bothPassed = state.players.friendly.passed && state.players.enemy.passed; //or both players hands are empty

  if (bothPassed) {
    // TODO: Calculate round winner, add to roundWins, reset for next round or end game
    return {
      ...state,
      phase: 'roundEnd',
    };
  }

  return state;
}

function resetForNewRound(state: GameState): GameState {
  //TODO: clear rows, check if done with game
  state.currentRound += 1;
  state.phase = 'draw';
  state.players.friendly.passed = false;
  state.players.enemy.passed = false;
  return state;
}

function newTurn(state: GameState): GameState {
  state.turn = { hasActivatedAbility: false, hasPlayedCard: false };
  state.currentPlayer = state.currentPlayer === 'friendly' ? 'enemy' : 'friendly';
  return state;
}

async function gameLoop(config: GameConfig, initialState: GameState) {
  let state = initialState;

  while (state.phase !== 'gameOver') {
    // --- Phase: Draw ---
    if (state.phase === 'draw') {
      console.log(`Starting round ${state.currentRound}`);
      state = drawCards(state, 'friendly', 3); // e.g. draw 3 each round
      state = drawCards(state, 'enemy', 3);
      // Trigger round-start effects
      state = triggerHook('onRoundStart', state, { player: 'friendly', source: null });
      state = triggerHook('onRoundStart', state, { player: 'enemy', source: null });
      state.phase = 'play';
      continue;
    }

    // --- Phase: Play ---
    if (state.phase === 'play') {
      console.log(`Player ${state.currentPlayer}'s turn.`);
      const controller = config.controllers[state.currentPlayer];
      const newState = await controller.makeMove(state, state.currentPlayer);
      state = newTurn(newState);

      const bothPassed = state.players.friendly.passed && state.players.enemy.passed;
      const bothHandsEmpty = state.players.friendly.hand.length === 0 && state.players.enemy.hand.length === 0;

      if (bothPassed || bothHandsEmpty) {
        state.phase = 'roundEnd';
        continue;
      }
      continue;
    }

    // --- Phase: End (End of Round) ---
    if (state.phase === 'roundEnd') {
      const friendlyPoints = state.players.friendly.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);
      const enemyPoints = state.players.enemy.rows.flatMap(r => r.cards).reduce((sum, c) => sum + c.currentPower, 0);

      if (friendlyPoints > enemyPoints) {
        state.players.friendly.roundWins += 1;
        console.log(`Round ${state.currentRound} goes to Friendly (${friendlyPoints} vs ${enemyPoints})`);
      } else if (enemyPoints > friendlyPoints) {
        state.players.enemy.roundWins += 1;
        console.log(`Round ${state.currentRound} goes to Enemy (${enemyPoints} vs ${friendlyPoints})`);
      } else {
        console.log(`Round ${state.currentRound} is a tie! (${friendlyPoints} vs ${enemyPoints})`);
      }

      // Trigger round-end effects
      state = triggerHook('onRoundEnd', state, { player: 'friendly', source: null });
      state = triggerHook('onRoundEnd', state, { player: 'enemy', source: null });

      // Clear the board
      state.players.friendly.rows.forEach(row => row.cards = []);
      state.players.enemy.rows.forEach(row => row.cards = []);

      // Check for game over
      const friendlyWins = state.players.friendly.roundWins;
      const enemyWins = state.players.enemy.roundWins;
      const maxRoundsReached = state.currentRound >= 3;
      const gameIsOver = friendlyWins === 2 || enemyWins === 2 || maxRoundsReached;

      if (gameIsOver) {
        state.phase = 'gameOver';
        const winner = friendlyWins > enemyWins ? 'Friendly' : (enemyWins > friendlyWins ? 'Enemy' : 'Draw');
        console.log(`Game Over! Winner: ${winner}`);
        break;
      }

      // Prepare next round
      state = resetForNewRound(state);
      continue;
    }
  }
}


function passTurn(state: GameState, player: PlayerRole): GameState {
  const playerState = state.players[player];
  if (playerState.passed) {
    console.warn(`${player} has already passed this turn.`);
    return state; // Cannot pass again
  }

  return {
    ...state,
    players: {
      ...state.players,
      [player]: {
        ...playerState,
        passed: true
      }
    },
    turn: {
      ...state.turn,
      hasPlayedCard: true // Passing counts as playing a card
    }
  };
}
const dummyPlayer: PlayerController = {
  type: 'human',
  makeMove: async (state, role) => {
    console.log(`It's ${role}'s turn.`);
    console.log('Hand: ', state.players[role].hand.map(c => c.baseCard.name));
    console.log('Rows: ', state.players[role].rows.map(r => ({
      id: r.id,
      cards: r.cards.map(c => c.baseCard.name)
    })));
    return passTurn(state, role); // For now, just pass the turn
  }
};

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

function flipCoin(): boolean {
  return Math.random() < 0.5;
}
function drawCards(state: GameState, player: PlayerRole, count: number): GameState {
  const playerState = state.players[player];
  const drawn = playerState.deck.slice(0, count);
  const newDeck = playerState.deck.slice(count);

  return {
    ...state,
    players: {
      ...state.players,
      [player]: {
        ...playerState,
        hand: [...playerState.hand, ...drawn],
        deck: newDeck
      }
    }
  };
}

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

window.onload = async () => {
  const friendlyDeck = cardDefinitions.slice(0, 10).map(createCardInstance);
  const enemyDeck = cardDefinitions.slice(10, 20).map(createCardInstance);
  const state = createInitialGameState(friendlyDeck, enemyDeck);
  const config: GameConfig = {
    controllers: {
      friendly: dummyPlayer,
      enemy: dummyPlayer
    }
  }
  console.log(state);
  console.log('Game starting...');
  await gameLoop(config, state);
  console.log('Game finished.');
}