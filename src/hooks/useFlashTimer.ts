import { useState, useEffect } from 'react';

export const useFlashTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentHour = now.getHours();

            // Calculate the end hour of the current 3-hour block
            // Blocks: 0-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21, 21-24
            const nextBlockHour = (Math.floor(currentHour / 3) + 1) * 3;

            const endTime = new Date(now);
            endTime.setHours(nextBlockHour, 0, 0, 0);

            // Should handle day rollover automatically by Date object if nextBlockHour is 24
            // But setHours(24) correctly sets it to 00:00 next day

            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                // Should technically not happen often with 1s interval, but safe fallback
                return "00:00:00";
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return timeLeft;
};
