import React, { useState } from "react";
import { CardInstance } from "../core/types";

export type ZonePreviewProps = {
    title: string;
    cards: CardInstance[];
    position: React.CSSProperties;
};

export const ZonePreview: React.FC<ZonePreviewProps> = ({ title, cards, position }) => {
    const [hovered, setHovered] = useState(false);
    const [shouldOpenUpwards, setShouldOpenUpwards] = useState(false);
    const [shouldOpenLeft, setShouldOpenLeft] = useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);

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

    return (
        <div
            ref={cardRef}
            style={{ ...position }}
            className={className}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={title}
        >
            {title}
            {hovered && (
                <div className="zone-preview__tooltip">
                    <strong>{title} ({cards.length})</strong>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {cards.map(card => (
                            <li key={card.instanceId}>{card.baseCard.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ZonePreview