import React, { useState } from "react";
import { CardInstance } from "../core/types";

export type CardProps = {
  card: CardInstance;
  highlight?: boolean;
  onClick?: () => void;
};

export const Card: React.FC<CardProps> = ({
  card,
  highlight = false,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`card${highlight ? " card--highlight" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <div className="card__name">{card.baseCard.name}</div>
      <div className="card__power">
        Power: <span>{card.currentPower}</span>
      </div>
      {card.baseCard.type && <div className="card__type">Type: {card.baseCard.type.join(", ")}</div>}
      {card.baseCard.category && <div className="card__category">Category: {card.baseCard.category}</div>}
      {card.baseCard.provisionCost !== undefined && (
        <div className="card__provision">Provision: {card.baseCard.provisionCost}</div>
      )}
      {hovered && card.baseCard.description && (
        <div className="card__description-tooltip">{card.baseCard.description}</div>
      )}
    </div>
  );
};

export default Card;