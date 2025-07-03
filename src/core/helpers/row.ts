import { dealDamage, getLowestCard } from "../state";
import { CardInstance, HookType, Row, RowEffect, StatusType, WeatherType } from "../types";

export const weatherEffects: Record<WeatherType, RowEffect> = {
  frost: {
    type: WeatherType.Frost,
    description: 'Deal 2 damage to the lowest power card.',
    effects: [
      {
        hook: HookType.OnTurnEnd,
        effect: (context) => {
          const lowestPowerCard = getLowestCard();
          if (lowestPowerCard) {
            //TODO: REWORK SOURCE 
            dealDamage(lowestPowerCard, 2, null);
          }
        }
      }
    ]
  },
  fog: {
    type: WeatherType.Fog,
    description: 'Fog',
  },
  rain: {
    type: WeatherType.Rain,
    description: 'Rain',
  },
  storm: {
    type: WeatherType.Storm,
    description: 'Storm',
  },
  clearSkies: {
    type: WeatherType.ClearSkies,
    description: 'Clear Skies',
  }
};

export function getWeatherEffect(weather: WeatherType): RowEffect {
  return weatherEffects[weather];
}

export function hasWeatherEffect(row: Row, weather: WeatherType): boolean {
  //First in list is the active weather effect
  return row.effects[0]?.type === weather;
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