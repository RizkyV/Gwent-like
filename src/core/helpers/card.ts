import { CardColor, CardDefinition, CardInstance, CardTypeCategory } from "../types";
import { getCardController, getCardDefCountForPlayer } from "./board";

export const TypeCategoryMap: Record<string, CardTypeCategory> = {
  /**
   * Races
   */
  Human: CardTypeCategory.Race,
  Monster: CardTypeCategory.Race,
  Vampire: CardTypeCategory.Race,
  God: CardTypeCategory.Race,

  //Fauna
  Cow: CardTypeCategory.Race,
  Frog: CardTypeCategory.Race,
  Bear: CardTypeCategory.Race,

  /**
   * Classes
   */
  Soldier: CardTypeCategory.Class,
  Mage: CardTypeCategory.Class,
  Warrior: CardTypeCategory.Class,
  Noble: CardTypeCategory.Class,

  //Special types
  Tactic: CardTypeCategory.Class,

  //Resource types
  Location: CardTypeCategory.Class,

  /**
   * Factions
   */
  Jedi: CardTypeCategory.Faction,
  Sith: CardTypeCategory.Faction
};

export function getCardTypes(card: CardInstance, category?: CardTypeCategory): string[] {
  if(category) {
    return card.baseCard.types.filter((type) => TypeCategoryMap[type] === category)
  }
  return card.baseCard.types;
}

export function cardIsType(card: CardInstance, type: string): boolean {
  return card.baseCard.types.includes(type);
}

export function getCardBasePower(card: CardInstance): number {
  return card.currentBasePower ?? card.baseCard.basePower;
}

export function cardIsColor(card: CardDefinition, color: CardColor): boolean {
  return (card.colors ?? []).includes(color);
}
export function cardIsPrimaryColor(card: CardDefinition, color: CardColor): boolean {
  const colors = getColorCounts(card);
  return isMajorityEntry(colors, color);
}

export function isBonded(card: CardInstance): boolean {
  const controller = getCardController(card);
  const cardCount = getCardDefCountForPlayer(card, controller);
  return cardCount > 1;
}

export function getColorCounts(card: CardDefinition): Record<CardColor, number> {
  const counts: Record<CardColor, number> = {
    [CardColor.White]: 0,
    [CardColor.Blue]: 0,
    [CardColor.Black]: 0,
    [CardColor.Red]: 0,
    [CardColor.Green]: 0,
  };
  for (const color of card.colors ?? []) {
    counts[color]++;
  }
  return counts;
}
export function isMajorityEntry<T extends string | number | symbol>(
  record: Record<T, number>,
  key: T
): boolean {
  const total = Number(Object.values(record).reduce((sum: number, val: number) => sum + Number(val), 0));
  const value = Number(record[key] ?? 0);
  return value > total / 2;
}