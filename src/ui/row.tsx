import React from "react";
import HandCard from "./hand-card";
import { getRowPoints } from "../core/state";
import { CardInstance, PlayerRole, RowType } from "../core/types";
import { useDrop } from "react-dnd";

export type RowProps = {
  cards: CardInstance[];
  player: PlayerRole; // "friendly" or "enemy"
  rowData?: any; // Pass the actual row object for points calculation
  onCardClick: (card: CardInstance) => void;
  onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
  isTargeting: boolean;
  isValidTarget: (card: CardInstance) => boolean;
};
export const Row: React.FC<RowProps> = ({
  cards,
  player,
  rowData,
  onCardClick,
  onCardDrop,
  isTargeting,
  isValidTarget,
}) => {
  // Helper for drop zones
  const DropZone = ({ index }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'CARD',
      drop: (item: CardInstance) => onCardDrop(item, rowData.id, player, index),
      canDrop: (item) => {
        return item.baseCard.isValidRow(item, player, rowData.id);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }));
    const divRef = React.useRef<HTMLDivElement>(null);
    drop(divRef);
    return (
      <div
        ref={divRef}
        className={`row__drop-zone${isOver && canDrop ? " row__drop-zone--active" : ""}${canDrop ? " row__drop-zone--can-drop" : ""}`}
      />
    );
  };
  return (
    <div className="row">
      <div className="row__header">
        {player && <h3 className="row__title">{player} {rowData.id} Row</h3>}
        {rowData && (
          <span className="row__points">
            Points: <strong>{getRowPoints(rowData)}</strong>
          </span>
        )}
      </div>
      <div className="row__cards">
        {cards.map((card, idx) => (
          <React.Fragment key={card.instanceId}>
            <DropZone index={idx} />
            <HandCard
              key={card.instanceId}
              card={card}
              highlight={isTargeting && isValidTarget(card)}
              onClick={() => isTargeting && isValidTarget(card) && onCardClick(card)}
              showTargetButton={isTargeting && isValidTarget(card)}
            />
          </React.Fragment>
        ))}
        <DropZone index={rowData.cards.length} />
      </div>
    </div>
  )
};

export default Row;