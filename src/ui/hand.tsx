import React from "react";
import HandCard from "./hand-card";
import { CardInstance } from "../core/types";

export type HandProps = {
  cards: CardInstance[];
  title?: string;
  selectedCard?: CardInstance | null;
  isTargeting?: boolean;
  isValidTarget: (card: CardInstance) => boolean;
};

export const Hand: React.FC<HandProps> = ({ cards, title, selectedCard, isTargeting, isValidTarget }) => (
  <div className="hand">
    {title && <h2 className="hand__title">{title}</h2>}
    <div className="hand__cards">
      {cards.map(card => (
        <HandCard
          key={card.instanceId}
          card={card}
          highlight={selectedCard?.instanceId === card.instanceId}
          showTargetButton={isTargeting && isValidTarget(card)}
        />
      ))}
    </div>
  </div>
);

export default Hand;