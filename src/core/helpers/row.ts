import { getEffectSourceRow } from "../cards";
import { dealDamage, getHighestCard, getLowestCard, tickRowEffectDuration } from "../state";
import { CardInstance, EffectContext, HookType, Row, RowEffect, RowEffectType} from "../types";

export const rowEffects: Record<RowEffectType, RowEffect> = {
  frost: {
    type: RowEffectType.Frost,
    name: 'Frost',
    description: 'Deal 2 damage to the lowest power card.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          const row = context.self.kind === 'row' ? context.self.row : null;
          if (!row) return;
          if(!isFriendlyTurn(context)) return;
          const lowestPowerCard = getLowestCard();
          if (lowestPowerCard) {
            dealDamage(lowestPowerCard, 2, { kind: 'rowEffect', type: RowEffectType.Frost, row: row });
          }
          tickRowEffectDuration(row);
        }
      }
    ]
  },
  fog: {
    type: RowEffectType.Fog,
    name: 'Fog',
    description: 'Deal 2 damage to the highest power card.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          //TODO: change to highest power instead
          const row = context.self.kind === 'rowEffect' ? context.self.row : null;
          if (!row) return;
          if(!isFriendlyTurn(context)) return;
          const highestPowerCard = getHighestCard();
          if (highestPowerCard) {
            dealDamage(highestPowerCard, 2, { kind: 'rowEffect', type: RowEffectType.Fog, row: row });
          }
          tickRowEffectDuration(row);
        }
      }
    ]
  },
  rain: {
    type: RowEffectType.Rain,
    name: 'Rain',
    description: 'Rain',
  },
  storm: {
    type: RowEffectType.Storm,
    name: 'Storm',
    description: 'Storm',
  },
  clearSkies: {
    type: RowEffectType.ClearSkies,
    name: 'Clear Skies',
    description: 'Clear Skies',
  }
};

export function isFriendlyTurn(context: EffectContext): boolean {
  const self = getEffectSourceRow(context.self);
  if (!self) return null;
  return context.player === self.player;
}

export function getRowEffect(rowEffect: RowEffectType): RowEffect {
  return rowEffects[rowEffect];
}

export function hasRowEffect(row: Row, rowEffect: RowEffectType): boolean {
  //First in list is the active weather effect
  return row.effects[0]?.type === rowEffect;
}