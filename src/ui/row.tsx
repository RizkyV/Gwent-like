import React from "react";
import Card from "./card";
import { getRowPoints } from "../core/state";
import { CardInstance } from "../core/types";

export type RowProps = {
  cards: CardInstance[];
  title?: string;
  rowData?: any; // Pass the actual row object for points calculation
  onCardClick: (card: CardInstance) => void;
  isTargeting: boolean;
  isValidTarget: (card: CardInstance) => boolean;
};

export const Row: React.FC<RowProps> = ({
  cards,
  title,
  rowData,
  onCardClick,
  isTargeting,
  isValidTarget,
}) => (
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
      {cards.map((card) => (
        <Card
          key={card.instanceId}
          card={card}
          highlight={isTargeting && isValidTarget(card)}
          onClick={() => isTargeting && isValidTarget(card) && onCardClick(card)}
          showTargetButton={isTargeting && isValidTarget(card)}
        />
      ))}
    </div>
  </div>
);

export default Row;