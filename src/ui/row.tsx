import React from "react";
import HandCard from "./hand-card";
import { getRowPoints } from "../core/state";
import { CardInstance } from "../core/types";
import type { Row as RowData } from "../core/types";
import { useDrop } from "react-dnd";
import { handleCardDrop, handleAbilityActivate, handleTargetClick, isValidTarget, handleRowDropConfirm, getLocalizedPlayer, getLocalizedRowType } from "./ui-helpers";
import { useTranslation } from "react-i18next";
import { getRowEffect } from "../core/helpers/row";
import { uiStateStore } from "./game-controller";

export type RowProps = {
  row: RowData;
};

export const Row: React.FC<RowProps> = ({ row }) => {
  const { selectedHandCard, isTargeting, setPendingAction } = uiStateStore();
  const showTargetButton = isTargeting && isValidTarget({ kind: "row", row });
  const { t } = useTranslation();


  // Helper for drop zones
  const DropZone = ({ index }) => {
    const { uiPhase } = uiStateStore();
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'CARD',
      drop: (item: CardInstance) => handleCardDrop(item, row.type, row.player, index),
      canDrop: (item) => {
        if (!item) {
          console.warn("Invalid item dropped on row", { item });
          return false;
        }
        return item.baseCard.isValidRow(item, row.player, row.type);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }));
    const divRef = React.useRef<HTMLDivElement>(null);
    drop(divRef);

    // In playing phase, allow clicking the drop zone to confirm placement
    const handleClick = () => {
      if (uiPhase === "playing") {
        setPendingAction({ type: "play", card: selectedHandCard, rowType: row.type, player: row.player, index });
        handleRowDropConfirm();
      }
    };
    const showDropZone = canDrop || (uiPhase === "playing" && selectedHandCard.baseCard.isValidRow(selectedHandCard, row.player, row.type));
    return (
      <div
        ref={divRef}
        className={`row__drop-zone${isOver && showDropZone ? " row__drop-zone--active" : ""}${showDropZone ? " row__drop-zone--can-drop" : ""}`}
        onClick={handleClick}
        style={{ cursor: uiPhase === "playing" ? "pointer" : undefined }}
      />
    );
  };
  return (
    <div className="row" onClick={() => {
      if (isTargeting && isValidTarget({ kind: "row", row })) {
        handleTargetClick({ kind: "row", row });
      }
    }}>
      <div className="row__header">
        <span className="row__title">
          {getLocalizedPlayer(row.player)} {getLocalizedRowType(row.type)} <span className="row__points">({getRowPoints(row)})</span>
        </span>
        {showTargetButton && (
          <button className="card__action-btn" >{t('actions.target')}</button>
        )}
      </div>
      {row.effects && row.effects.length > 0 && (
        <div className="row__effects">
          {row.effects.map((effect, idx) => (
            <span key={idx} className="row__effect">{getRowEffect(effect.type).name} - Duration: {effect.duration}</span>
          ))}
        </div>
      )}
      <div className="row__cards">
        {row.cards.map((card, idx) => (
          <React.Fragment key={card.instanceId}>
            <DropZone index={idx} />
            <HandCard
              key={card.instanceId}
              card={card}
              allowDragging={false}
              highlight={isTargeting && isValidTarget({ kind: "card", card })}
              onClick={() => {
                if (isTargeting && isValidTarget({ kind: "card", card })) {
                  handleTargetClick({ kind: "card", card });
                } else {
                  handleAbilityActivate(card);
                }
              }}
            />
          </React.Fragment>
        ))}
        <DropZone index={row.cards.length} />
      </div>
    </div>
  );
};

export default Row;