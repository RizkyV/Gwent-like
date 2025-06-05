import React from "react";
import HandCard from "./hand-card";
import { CardInstance } from "../core/types";

export type HandProps = {
  cards: CardInstance[];
  title?: string;
  onCardClick: (card: CardInstance) => void;
  selectedCard?: CardInstance | null;
  isTargeting?: boolean;
  canPlay?: boolean;
};

export const Hand: React.FC<HandProps> = ({ cards, title, onCardClick, selectedCard, isTargeting, canPlay }) => (
  <div className="hand">
    {title && <h2 className="hand__title">{title}</h2>}
    <div className="hand__cards">
      {cards.map(card => (
        <HandCard
          key={card.instanceId}
          card={card}
          highlight={selectedCard?.instanceId === card.instanceId}
          onClick={() => canPlay && onCardClick(card)}
          showPlayButton={canPlay && !isTargeting}
          showTargetButton={false}
        />
      ))}
    </div>
  </div>
);

export default Hand;