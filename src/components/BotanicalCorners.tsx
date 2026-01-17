import React from "react";

export function BotanicalCorners() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Top Left */}
            <div
                className="absolute left-0 top-0 h-32 w-32 md:h-48 md:w-48 opacity-45 mix-blend-multiply"
                style={{
                    backgroundImage: 'url(/images/ornaments/botanical-corners.png)',
                    backgroundPosition: '0% 0%',
                    backgroundSize: '200%' // Zoom in to show 1/4 of the sprite
                }}
            />
            {/* Top Right */}
            <div
                className="absolute right-0 top-0 h-32 w-32 md:h-48 md:w-48 opacity-45 mix-blend-multiply"
                style={{
                    backgroundImage: 'url(/images/ornaments/botanical-corners.png)',
                    backgroundPosition: '100% 0%',
                    backgroundSize: '200%'
                }}
            />
            {/* Bottom Left */}
            <div
                className="absolute bottom-0 left-0 h-32 w-32 md:h-48 md:w-48 opacity-45 mix-blend-multiply"
                style={{
                    backgroundImage: 'url(/images/ornaments/botanical-corners.png)',
                    backgroundPosition: '0% 100%',
                    backgroundSize: '200%'
                }}
            />
            {/* Bottom Right */}
            <div
                className="absolute bottom-0 right-0 h-32 w-32 md:h-48 md:w-48 opacity-45 mix-blend-multiply"
                style={{
                    backgroundImage: 'url(/images/ornaments/botanical-corners.png)',
                    backgroundPosition: '100% 100%',
                    backgroundSize: '200%'
                }}
            />
        </div>
    );
}
