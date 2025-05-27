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
    style={{
      border: highlight ? "2px solid gold" : "1px solid #333",
      borderRadius: "8px",
      padding: "12px",
      background: "#223",
      color: "#fff",
      width: "160px",
      margin: "8px",
      boxShadow: highlight
        ? "0 0 12px 2px gold"
        : "0 2px 8px rgba(0,0,0,0.2)",
      cursor: onClick ? "pointer" : "default",
      userSelect: "none",
    }}
    onClick={onClick}
  >
    <div style={{ fontWeight: "bold", fontSize: "1.2em" }}>{name}</div>
    <div>Power: <span style={{ fontWeight: "bold" }}>{power}</span></div>
    {type && <div>Type: {type.join(", ")}</div>}
    {category && <div>Category: {category}</div>}
    {provisionCost !== undefined && (
      <div>Provision: {provisionCost}</div>
    )}
  </div>
);

export default Card;