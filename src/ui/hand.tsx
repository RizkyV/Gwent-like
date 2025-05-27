import React from "react";
import Card, { CardProps } from "./card";

export type HandProps = {
  cards: CardProps[];
  title?: string;
};

export const Hand: React.FC<HandProps> = ({ cards, title }) => (
  <div style={{ margin: "16px 0" }}>
    {title && <h2 style={{ color: "#fff" }}>{title}</h2>}
    <div style={{ display: "flex", flexDirection: "row" }}>
      {cards.map((card, idx) => (
        <Card key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Hand;