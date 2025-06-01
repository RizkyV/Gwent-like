import React from "react";
import Card from "./card";
import { CardInstance } from "../core/types";

export type HandProps = {
  cards: CardInstance[];
  title?: string;
};

export const Hand: React.FC<HandProps> = ({ cards, title }) => (
  <div className="hand">
    {title && <h2 className="hand__title">{title}</h2>}
    <div className="hand__cards">
      {cards.map((card, idx) => (
        <Card card={card} key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Hand;