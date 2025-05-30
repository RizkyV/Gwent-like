import { GameEffect, CardDefinition } from '../core/types.js';
import { getRows, setRows, getCardOwner, updateCardInState } from './logic.js';

export const boostAllFriendlyUnits: GameEffect = (state, context) => {
  const rows = getRows(state, context.player);
  const boostedRows = rows.map(row => ({
    ...row,
    cards: row.cards.map(card => ({
      ...card,
      currentPower: card.currentPower + 1
    }))
  }));
  return setRows(state, context.player, boostedRows);
};

export const boostSelfOnEnemyDamaged: GameEffect = (state, context) => {
  const { source } = context;
  const damagedCard = context.metadata?.damagedCard;
  if (!damagedCard) return state;

  const sourceOwner = getCardOwner(state, source);
  const damagedOwner = getCardOwner(state, damagedCard);

  if (sourceOwner === damagedOwner) return state;

  return updateCardInState(state, source.instanceId, card => ({
    ...card,
    currentPower: card.currentPower + 1
  }));
};

export const cardDefinitions: CardDefinition[] = [
  {
    id: 'card1',
    name: 'Card One',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card One',
  },
  {
    id: 'card2',
    name: 'Card Two',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Two',
  },
  {
    id: 'card3',
    name: 'Card Three',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Three',
  },
  {
    id: 'card4',
    name: 'Card Four',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Four',
  },
  {
    id: 'card5',
    name: 'Card Five',
    type: ['warrior'],
    basePower: 10,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Five',
  },
  {
    id: 'card6',
    name: 'Card Six',
    type: ['warrior'],
    basePower: 6,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Six',
  },
  {
    id: 'card7',
    name: 'Card Seven',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Seven',
  },
  {
    id: 'card8',
    name: 'Card Eight',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Eight',
  },
  {
    id: 'card9',
    name: 'Card Nine',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Nine',
  },
  {
    id: 'card10',
    name: 'Card Ten',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    description: 'Card Ten',
  }
];