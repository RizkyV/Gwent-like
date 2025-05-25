import { GameEffect, CardDefinition, PlayerRole, CardInstance, EffectContext } from '../core/types.js';
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
    effects: [
      {
        hook: 'onPlay',
        effect: boostAllFriendlyUnits
      }
    ]
  },
  {
    id: 'card2',
    name: 'Card Two',
    type: ['warrior'],
    basePower: 5,
    category: 'unit',
    provisionCost: 5,
    effects: [
      {
        hook: 'onDamaged',
        effect: boostSelfOnEnemyDamaged
      }
    ]
  }
];