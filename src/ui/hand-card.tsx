import React, { useState } from "react";
import { CardInstance } from "../core/types";
import { useDrag } from "react-dnd";

export type CardProps = {
  card: CardInstance;
  highlight?: boolean;
  onClick?: () => void;
  showPlayButton?: boolean;
  showTargetButton?: boolean;
};

export const HandCard: React.FC<CardProps> = ({
  card,
  highlight = false,
  onClick,
  showPlayButton,
  showTargetButton,
}) => {
  const [hovered, setHovered] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const divRef = React.useRef<HTMLDivElement>(null);
  drag(divRef);

  return (
    <div ref={divRef}
      className={`card${highlight ? " card--highlight" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", opacity: isDragging ? 0.5 : 1 }}
    >
      {card.baseCard.artworkUrl && <img className="card__art" src={card.baseCard.artworkUrl} alt={card.baseCard.name}></img>}
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
      {showPlayButton && (
        <button className="card__action-btn">Play</button>
      )}
      {showTargetButton && (
        <button className="card__action-btn">Target</button>
      )}
    </div>
  );
};

export default HandCard;