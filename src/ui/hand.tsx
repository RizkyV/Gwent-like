import React from "react";
import HandCard from "./hand-card";
import { CardInstance } from "../core/types";
import { uiStateStore } from "./game-controller";

export type HandProps = {
  cards: CardInstance[];
  title?: string;
};

export const Hand: React.FC<HandProps> = ({ cards, title }) => {
  const { selectedHandCard, isTargeting } = uiStateStore();
  return (
    <div className="hand">
      {title && <h2 className="hand__title">{title}</h2>}
      <div className="hand__cards">
        {cards.map(card => (
          <HandCard
            key={card.instanceId}
            card={card}
            highlight={selectedHandCard?.instanceId === card.instanceId}
          />
        ))}
      </div>
    </div>
  );
};

export default Hand;