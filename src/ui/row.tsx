import React from "react";
import Card, { CardProps } from "./card";

export type RowProps = {
  cards: CardProps[];
  title?: string;
};

export const Row: React.FC<RowProps> = ({ cards, title }) => (
  <div style={{ margin: "12px 0" }}>
    {title && <h3 style={{ color: "#fff" }}>{title}</h3>}
    <div style={{ display: "flex", flexDirection: "row" }}>
      {cards.map((card, idx) => (
        <Card key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Row;