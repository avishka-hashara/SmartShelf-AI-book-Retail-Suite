import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

export default function LiveTimer({ checkInAt }) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!checkInAt) return;

        const checkInTime = new Date(checkInAt);

        const tick = () => {
            const now = new Date();
            const diff = differenceInSeconds(now, checkInTime);
            setElapsedSeconds(diff >= 0 ? diff : 0);
        };

        // Initial tick
        tick();

        // Setup interval
        const intervalId = setInterval(tick, 1000);

        return () => clearInterval(intervalId);
    }, [checkInAt]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [
            h.toString().padStart(2, '0'),
            m.toString().padStart(2, '0'),
            s.toString().padStart(2, '0')
        ].join(':');
    };

    return (
        <span className="tabular-nums">
            {formatTime(elapsedSeconds)}
        </span>
    );
}
