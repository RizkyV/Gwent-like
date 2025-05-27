import React from "react";

export type CardProps = {
  name: string;
  power: number;
  type?: string[];
  category?: string;
  provisionCost?: number;
  highlight?: boolean;
  onClick?: () => void;
};

export const Card: React.FC<CardProps> = ({
  name,
  power,
  type,
  category,
  provisionCost,
  highlight = false,
  onClick,
}) => (
  <div
    className={`card${highlight ? " card--highlight" : ""}`}
    onClick={onClick}
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
  </div>
);

export default Card;