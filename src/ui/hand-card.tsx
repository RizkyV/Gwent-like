import React, { useState } from "react";
import { CardInstance } from "../core/types";
import { useDrag } from "react-dnd";
import { useTranslation } from "react-i18next";

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
  const [shouldOpenUpwards, setShouldOpenUpwards] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  React.useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const tooltipHeight = 200; // Estimate or measure your tooltip height
      if (rect.bottom + tooltipHeight > window.innerHeight) {
        setShouldOpenUpwards(true);
      } else {
        setShouldOpenUpwards(false);
      }
    }
  }, [hovered]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: card,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    drag(node);
  };

  const hasArt = !!card.baseCard.artworkUrl;

  return (
    <div
      ref={combinedRef}
      className={`card${highlight ? " card--highlight" : ""}${shouldOpenUpwards ? " card--tooltip-upwards" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", opacity: isDragging ? 0.5 : 1 }}
    >
      {hasArt ? (
        <>
          <img className="card__art" src={card.baseCard.artworkUrl!} alt={card.baseCard.name} />
          {hovered && (
            <div className="card__description-tooltip" style={{ zIndex: 10 }}>
              <div className="card__name">{t(card.baseCard.name)}</div>
              <div className="card__power">
                {t('game.power')}: <span>{card.currentPower}</span>
              </div>
              {card.currentArmor > 0 && (
                <div className="card__armor">
                  {t('game.armor')}: <span>{card.currentArmor}</span>
                </div>
              )}
              {card.baseCard.types && (
                <div className="card__type">Type: {card.baseCard.types.join(", ")}</div>
              )}
              {card.statuses && card.statuses.size > 0 && (
                <div className="card__statuses">
                  Statuses: {[...card.statuses.values()]
                    .map(statusObj =>
                      statusObj.duration !== undefined
                        ? `${statusObj.type} (${statusObj.duration})`
                        : statusObj.type
                    )
                    .join(", ")}
                </div>
              )}
              {card.baseCard.category && (
                <div className="card__category">{t('game.category')}: {card.baseCard.category}</div>
              )}
              {card.baseCard.description && (
                <div className="card__description">{t(card.baseCard.description)}</div>
              )}
              {showPlayButton && (
                <button className="card__action-btn">Play</button>
              )}
              {showTargetButton && (
                <button className="card__action-btn">Target</button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card__name">{t(card.baseCard.name)}</div>
          <div className="card__power">
            {t('game.power')}: <span>{card.currentPower}</span>
          </div>
          {card.currentArmor > 0 && (
            <div className="card__armor">
              {t('game.armor')}: <span>{card.currentArmor}</span>
            </div>
          )}
          {card.baseCard.types && (
            <div className="card__type">Type: {card.baseCard.types.join(", ")}</div>
          )}
          {card.statuses && card.statuses.size > 0 && (
            <div className="card__statuses">
              Statuses: {[...card.statuses.values()]
                .map(statusObj =>
                  statusObj.duration !== undefined
                    ? `${statusObj.type} (${statusObj.duration})`
                    : statusObj.type
                )
                .join(", ")}
            </div>
          )}
          {card.baseCard.category && (
            <div className="card__category">{t('game.category')}: {card.baseCard.category}</div>
          )}
          {hovered && card.baseCard.description && (
            <div className="card__description-tooltip" style={{ zIndex: 10 }}>
              <div className="card__description">{t(card.baseCard.description)}</div>
            </div>
          )}
          {showPlayButton && (
            <button className="card__action-btn">Play</button>
          )}
          {showTargetButton && (
            <button className="card__action-btn">Target</button>
          )}
        </>
      )}
    </div>
  );
};

export default HandCard;