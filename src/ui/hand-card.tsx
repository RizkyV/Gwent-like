import React, { useState } from "react";
import { CardInstance } from "../core/types";
import { useDrag } from "react-dnd";
import { useTranslation } from "react-i18next";
import { uiStateStore } from "./game-controller";
import { canPlayCard, getLocalizedCardDescription, getLocalizedCardName } from "./ui-helpers";

export type CardProps = {
  card: CardInstance;
  allowDragging?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  showPlayButton?: boolean;
};
//TODO: rendering options - 1 inline (prov name power) - 2 game card (image with overlays) - 3 full (everything) 
export const HandCard: React.FC<CardProps> = ({
  card,
  allowDragging = true,
  highlight = false,
  onClick,
  showPlayButton,
}) => {
  const [hovered, setHovered] = useState(false);
  const [shouldOpenUpwards, setShouldOpenUpwards] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { isUiActive, setSelectedHandCard, setUIPhase, setPlayInitiator } = uiStateStore();

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

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CARD',
    canDrag: () => {
      console.log(isUiActive, allowDragging, canPlayCard());
      return allowDragging && canPlayCard() && isUiActive;
    },
    item: () => {
      setSelectedHandCard(card);
      setUIPhase("playing");
      setPlayInitiator("user");
      return card;
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        setSelectedHandCard(card);
        setUIPhase("playing");
        setPlayInitiator("user");
      }
    },
  }), [allowDragging, card, setSelectedHandCard, setUIPhase, setPlayInitiator]);

  // Add a "sticky" card preview if in playing phase and this is the selected card
  const { uiPhase, selectedHandCard } = uiStateStore();
  const isSticky = uiPhase === "playing" && selectedHandCard?.instanceId === card.instanceId;

  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    drag(node);
  };

  const hasArt = !!card.baseCard.artworkUrl;

  return (
    <>

      <div
        ref={combinedRef}
        className={`card${highlight ? " card--highlight" : ""}${shouldOpenUpwards ? " card--tooltip-upwards" : ""}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          opacity: isDragging ? 0.5 : 1,
          zIndex: isSticky ? 1000 : undefined,
          pointerEvents: isSticky ? "none" : undefined,
        }}
      >
        {hasArt ? (
          <>
            <img className="card__art" src={card.baseCard.artworkUrl!} alt={card.baseCard.name} />
            {hovered && (
              <div className="card__description-tooltip">
                <div className="card__name">{getLocalizedCardName(card, t)}</div>
                <div className="card__power">
                  {t('card.power')}: <span>{card.currentPower}</span>
                </div>
                {card.currentArmor > 0 && (
                  <div className="card__armor">
                    {t('card.armor')}: <span>{card.currentArmor}</span>
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
                  <div className="card__category">{t('card.category')}: {card.baseCard.category}</div>
                )}
                {card.baseCard.description && (
                  <div className="card__description">{getLocalizedCardDescription(card, t)}</div>
                )}
                {showPlayButton && (
                  <button className="card__action-btn">{t('actions.play')}</button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="card__name">{getLocalizedCardName(card, t)}</div>
            <div className="card__power">
              {t('card.power')}: <span>{card.currentPower}</span>
            </div>
            {card.currentArmor > 0 && (
              <div className="card__armor">
                {t('card.armor')}: <span>{card.currentArmor}</span>
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
              <div className="card__category">{t('card.category')}: {card.baseCard.category}</div>
            )}
            {hovered && card.baseCard.description && (
              <div className="card__description-tooltip">
                <div className="card__description">{getLocalizedCardDescription(card, t)}</div>
              </div>
            )}
            {showPlayButton && (
              <button className="card__action-btn">{t('actions.play')}</button>
            )}
          </>
        )}
      </div>
      {isSticky && !isDragging && <StickyCardPreview card={card} />}
    </>
  );
};

export default HandCard;

// StickyCardPreview component
const StickyCardPreview: React.FC<{ card: CardInstance }> = ({ card }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      className="card card--sticky"
      style={{
        position: "fixed",
        left: pos.x + 8,
        top: pos.y + 8,
        pointerEvents: "none",
        zIndex: 2000,
        width: "90px", // match $card-width
        height: "118px", // match $card-total-height
      }}
    >
      {/* Render a minimal card preview */}
      <img className="card__art" src={card.baseCard.artworkUrl!} alt={card.baseCard.name} />
    </div>
  );
};