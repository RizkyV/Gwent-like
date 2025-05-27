import React from "react";
import Card, { CardProps } from "./card";

export type HandProps = {
  cards: CardProps[];
  title?: string;
};

export const Hand: React.FC<HandProps> = ({ cards, title }) => (
  <div className="hand">
    {title && <h2 className="hand__title">{title}</h2>}
    <div className="hand__cards">
      {cards.map((card, idx) => (
        <Card key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Hand;