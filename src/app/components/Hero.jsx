"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {

    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const startTextRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();

        // Subtle background scale in
        tl.from(containerRef.current, {
            scale: 1.05,
            duration: 2,
            ease: "power2.out"
        });

        // Title drop-in
        tl.from(titleRef.current, {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "bounce.out"
        }, "-=1.5");

        // Subtitle fade in
        tl.from(subtitleRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.8,
        }, "-=0.5");

        // Blinking PRESS START text
        gsap.to(startTextRef.current, {
            opacity: 0,
            duration: 0.6,
            repeat: -1,
            yoyo: true,
            ease: "steps(1)" // Creates that retro choppy blink effect
        });

    }, []);

    return (
        <section
            ref={containerRef}
            className="h-screen w-full flex flex-col items-center justify-center text-center bg-black text-white px-6 relative overflow-hidden"
            style={{
                // Add a very subtle scanline effect as background
                backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
                backgroundSize: `100% 4px, 3px 100%`
            }}
        >
            <div className="z-10 flex flex-col items-center">
                <h1
                    ref={titleRef}
                    className="text-5xl md:text-7xl mb-6 font-pixel text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.8)] leading-tight"
                >
                    SNEHOJIT
                </h1>

                <p
                    ref={subtitleRef}
                    className="text-lg md:text-xl text-neon-blue font-pixel max-w-2xl drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] mb-16 leading-relaxed"
                >
                    CINEMATIC PIXEL EDITOR
                </p>

                <div
                    ref={startTextRef}
                    className="font-pixel text-neon-yellow text-xl md:text-2xl mt-8 drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]"
                >
                    INSERT COIN & SCROLL ↓
                </div>
            </div>

            {/* Some retro decorative grid lines */}
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-neon-pink/20 to-transparent flex items-end justify-center pointer-events-none opacity-50">
                <div className="w-full h-full border-t border-neon-pink/30 shadow-[0_0_15px_rgba(255,0,255,0.2)]"
                    style={{
                        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent)',
                        backgroundSize: '50px 50px',
                        transform: 'perspective(500px) rotateX(60deg)',
                        transformOrigin: 'bottom'
                    }}
                ></div>
            </div>

        </section>
    );
}