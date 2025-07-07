import React, { useState } from "react";
import { CardInstance, Zone } from "../core/types";
import { useTranslation } from "react-i18next";

export type ZonePreviewProps = {
    title: string;
    zone: Zone;
    cards: CardInstance[];
    position: React.CSSProperties;
};

export const ZonePreview: React.FC<ZonePreviewProps> = ({ title, zone, cards, position }) => {
    const [hovered, setHovered] = useState(false);
    const [shouldOpenUpwards, setShouldOpenUpwards] = useState(false);
    const [shouldOpenLeft, setShouldOpenLeft] = useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    React.useEffect(() => {
        if (hovered && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const tooltipHeight = 200;
            const tooltipWidth = 180;
            setShouldOpenUpwards(rect.bottom + tooltipHeight > window.innerHeight);
            setShouldOpenLeft(rect.left + tooltipWidth > window.innerWidth);
        }
    }, [hovered]);

    let className = "zone-preview";
    if (shouldOpenUpwards) className += " zone-preview--upwards";
    if (shouldOpenLeft) className += " zone-preview--left";
    let imgUrl = '';
    if (zone === Zone.Graveyard) imgUrl = import.meta.env.BASE_URL + 'assets/icons/graveyard.png'
    if (zone === Zone.Deck) imgUrl = import.meta.env.BASE_URL + 'assets/icons/deck.png'
    return (
        <div
            ref={cardRef}
            style={{ ...position }}
            className={className}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={title}
        >
            {imgUrl && <img src={imgUrl} alt={title} className="zone-preview__icon" />}
            {hovered && (
                <div className="zone-preview__tooltip">
                    <strong>{title} ({cards.length})</strong>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {cards.map(card => (
                            <li key={card.instanceId}>{card.baseCard.provisionCost} {t(card.baseCard.name)} {card.currentPower ?? card.currentPower}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ZonePreview