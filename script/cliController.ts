import promptSync from 'prompt-sync';
const prompt = promptSync();

export const humanCLIController: PlayerController = {
  type: 'human',
  makeMove: async (state, role) => {
    const playerState = state.players[role];

    console.log(`\n${role.toUpperCase()}'s TURN`);
    console.log(`Hand:`);
    playerState.hand.forEach((card, i) => {
      console.log(`${i}: ${card.baseCard.name} (${card.currentPower} power)`);
    });

    const cardIndex = parseInt(prompt('Choose a card to play (index): '), 10);
    const card = playerState.hand[cardIndex];

    if (!card) {
      console.log('Invalid selection, passing turn.');
      return passTurn(state, role);
    }

    const rowChoice = prompt('Choose a row to play on (melee/ranged): ') as 'melee' | 'ranged';
    const validRow = rowChoice === 'melee' || rowChoice === 'ranged' ? rowChoice : 'melee';

    // Remove card from hand and place it on the board
    const updatedHand = playerState.hand.filter((_, i) => i !== cardIndex);
    const updatedRows = playerState.rows.map(row =>
      row.id === validRow ? { ...row, cards: [...row.cards, card] } : row
    );

    const newState = {
      ...state,
      players: {
        ...state.players,
        [role]: {
          ...playerState,
          hand: updatedHand,
          rows: updatedRows
        }
      },
      turn: {
        ...state.turn,
        hasPlayedCard: true
      }
    };

    // Trigger onPlay effect
    return resolveCardPlay(card, newState, role);
  }
};