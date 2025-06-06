import React from "react";
import HandCard from "./hand-card";
import { getRowPoints } from "../core/state";
import { CardInstance, PlayerRole, RowType } from "../core/types";
import type { Row as RowData } from "../core/types";
import { useDrop } from "react-dnd";

export type RowProps = {
  row: RowData;
  onCardClick: (card: CardInstance) => void;
  onCardDrop: (card: CardInstance, rowType: RowType, player: PlayerRole, index: number) => void;
  isTargeting: boolean;
  isValidTarget: (card: CardInstance) => boolean;
};
export const Row: React.FC<RowProps> = ({
  row,
  onCardClick,
  onCardDrop,
  isTargeting,
  isValidTarget,
}) => {
  // Helper for drop zones
  const DropZone = ({ index }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'CARD',
      drop: (item: CardInstance) => onCardDrop(item, row.type, row.player, index),
      canDrop: (item) => {
        return item.baseCard.isValidRow(item, row.player, row.type);
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
        {row.player && <h3 className="row__title">{row.player} {row.type} Row</h3>}
        {row && (
          <span className="row__points">
            Points: <strong>{getRowPoints(row)}</strong>
          </span>
        )}
      </div>
      <div className="row__cards">
        {row.cards.map((card, idx) => (
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
        <DropZone index={row.cards.length} />
      </div>
    </div>
  )
};

export default Row;