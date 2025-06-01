import React from "react";
import Card from "./card";
import { getRowPoints } from "../core/state";
import { CardInstance } from "../core/types";

export type RowProps = {
  cards: CardInstance[];
  title?: string;
  rowData?: any; // Pass the actual row object for points calculation
};

export const Row: React.FC<RowProps> = ({ cards, title, rowData }) => (
  <div className="row">
    <div className="row__header">
      {title && <h3 className="row__title">{title}</h3>}
      {rowData && (
        <span className="row__points">
          Points: <strong>{getRowPoints(rowData)}</strong>
        </span>
      )}
    </div>
    <div className="row__cards">
      {cards.map((card, idx) => (
        <Card card={card} key={idx} {...card} />
      ))}
    </div>
  </div>
);

export default Row;