import React from "react";
import Card, { CardProps } from "./card";

export type RowProps = {
  cards: CardProps[];
  title?: string;
};

export const Row: React.FC<RowProps> = ({ cards, title }) => (
  <div className="row">
    {title && <h3 className="row__title">{title}</h3>}
    <div className="row__cards">
      {cards.map((card, idx) => (
        <Card key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Row;