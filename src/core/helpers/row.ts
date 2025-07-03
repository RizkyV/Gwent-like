import { dealDamage, getLowestCard } from "../state";
import { CardInstance, HookType, Row, RowEffect, RowEffectType} from "../types";

export const rowEffects: Record<RowEffectType, RowEffect> = {
  frost: {
    type: RowEffectType.Frost,
    description: 'Deal 2 damage to the lowest power card.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          const row = context.self.kind === 'row' ? context.self.row : null;
          if (!row) return;
          const lowestPowerCard = getLowestCard();
          if (lowestPowerCard) {
            dealDamage(lowestPowerCard, 2, { kind: 'rowEffect', type: RowEffectType.Frost, row: row });
          }
        }
      }
    ]
  },
  fog: {
    type: RowEffectType.Fog,
    description: 'Fog',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          //TODO: change to highest power instead
          const row = context.self.kind === 'row' ? context.self.row : null;
          if (!row) return;
          const lowestPowerCard = getLowestCard();
          if (lowestPowerCard) {
            dealDamage(lowestPowerCard, 2, { kind: 'rowEffect', type: RowEffectType.Fog, row: row });
          }
        }
      }
    ]
  },
  rain: {
    type: RowEffectType.Rain,
    description: 'Rain',
  },
  storm: {
    type: RowEffectType.Storm,
    description: 'Storm',
  },
  clearSkies: {
    type: RowEffectType.ClearSkies,
    description: 'Clear Skies',
  }
};

export function getRowEffect(rowEffect: RowEffectType): RowEffect {
  return rowEffects[rowEffect];
}

export function hasRowEffect(row: Row, rowEffect: RowEffectType): boolean {
  //First in list is the active weather effect
  return row.effects[0]?.type === rowEffect;
}

export function tickStatusDurations(card: CardInstance): void {
  //TODO: Needs to go through setGameState
  let changed = false;
  const newStatuses = new Map(card.statuses);
  for (const [status, statusObj] of card.statuses.entries()) {
    if (statusObj.duration !== undefined) {
      if (statusObj.duration <= 1) {
        newStatuses.delete(status);
        changed = true;
      } else {
        newStatuses.set(status, { ...statusObj, duration: statusObj.duration - 1 });
        changed = true;
      }
    }
  }
  if (changed) {
    card.statuses = newStatuses;
  }
}