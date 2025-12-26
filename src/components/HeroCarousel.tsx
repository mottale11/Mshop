'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroCarousel.module.css';

type Banner = {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link: string;
};

interface HeroCarouselProps {
    banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0);
    const length = banners.length;

    // Auto-slide logic
    useEffect(() => {
        if (length <= 1) return;

        const interval = setInterval(() => {
            setCurrent(current === length - 1 ? 0 : current + 1);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [current, length]);

    const nextSlide = () => {
        setCurrent(current === length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? length - 1 : current - 1);
    };

    if (!Array.isArray(banners) || banners.length <= 0) {
        return null;
    }

    return (
        <div className={styles.slider}>
            {banners.map((banner, index) => (
                <div
                    className={index === current ? `${styles.slide} ${styles.active}` : styles.slide}
                    key={banner.id}
                >
                    {index === current && (
                        <div className={styles.slideContent}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={banner.image_url} alt={banner.title} className={styles.image} />

                            {(banner.title || banner.description) && (
                                <div className={styles.overlay}>
                                    {banner.title && <h1>{banner.title}</h1>}
                                    {banner.description && <p>{banner.description}</p>}
                                    {banner.link && (
                                        <Link href={banner.link} className={styles.button}>
                                            Shop Now
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {length > 1 && (
                <>
                    <button className={styles.leftArrow} onClick={prevSlide}>
                        <ChevronLeft size={32} />
                    </button>
                    <button className={styles.rightArrow} onClick={nextSlide}>
                        <ChevronRight size={32} />
                    </button>

                    <div className={styles.dots}>
                        {banners.map((_, idx) => (
                            <div
                                key={idx}
                                className={idx === current ? `${styles.dot} ${styles.activeDot}` : styles.dot}
                                onClick={() => setCurrent(idx)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
