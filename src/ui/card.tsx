import React, { useState } from "react";

export type CardProps = {
  name: string;
  power: number;
  type?: string[];
  category?: string;
  provisionCost?: number;
  description?: string;
  highlight?: boolean;
  onClick?: () => void;
};

export const Card: React.FC<CardProps> = ({
  name,
  power,
  type,
  category,
  provisionCost,
  description,
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
      <div className="card__name">{name}</div>
      <div className="card__power">
        Power: <span>{power}</span>
      </div>
      {type && <div className="card__type">Type: {type.join(", ")}</div>}
      {category && <div className="card__category">Category: {category}</div>}
      {provisionCost !== undefined && (
        <div className="card__provision">Provision: {provisionCost}</div>
      )}
      {hovered && description && (
        <div className="card__description-tooltip">{description}</div>
      )}
    </div>
  );
};

export default Card;