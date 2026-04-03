"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ParallaxBackground() {
    const skyRef = useRef(null);
    const mountainsRef = useRef(null);
    const treesRef = useRef(null);
    const streaksRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const trigger = skyRef.current.closest('section');
        const scrollConfig = {
            trigger: trigger,
            scrub: 1,
            start: "top top",
            end: "bottom bottom"
        };

        // 1. Far background (sky/stars) -> -5%
        gsap.to(skyRef.current, { xPercent: -5, ease: "none", scrollTrigger: scrollConfig, overwrite: "auto" });
        
        // 2. Mid background (mountains/grid) -> -15%
        gsap.to(mountainsRef.current, { xPercent: -15, ease: "none", scrollTrigger: scrollConfig, overwrite: "auto" });
        
        // 3. Foreground (trees/spikes) -> -35%
        gsap.to(treesRef.current, { xPercent: -35, ease: "none", scrollTrigger: scrollConfig, overwrite: "auto" });
        
        // 4. Ultra foreground drift -> subtle drift (-50%)
        gsap.to(streaksRef.current, { xPercent: -50, ease: "none", scrollTrigger: scrollConfig, overwrite: "auto" });

        // 6. Idle World Motion (Even without scrolling)
        [skyRef, mountainsRef, treesRef].forEach((ref, index) => {
            gsap.to(ref.current, {
                y: `+=${1 + index}`, // 1px, 2px, 3px subtle oscillation
                duration: 6 + index * 2, // 6s, 8s, 10s
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                overwrite: "auto"
            });
        });

    }, []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#03010a]">
            {/* Layer 1: Sky / Stars (-5%) */}
            <div 
                ref={skyRef}
                className="env-layer absolute top-[-10%] -left-[10%] h-[120%] w-[130%] bg-[#08051a] flex items-start"
                style={{
                    background: 'linear-gradient(to bottom, #050212, #100a2b, #0a061c)',
                    filter: 'blur(1px) opacity(0.9)'
                }}
            >
                {/* Subtle static stars */}
                <div className="absolute inset-0 opacity-30" 
                     style={{
                         backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 1px, transparent 2px)',
                         backgroundSize: '120px 120px',
                         backgroundPosition: '0 0, 60px 60px'
                     }}>
                </div>
            </div>

            {/* Layer 2: Mountains (-15%) */}
            <div 
                ref={mountainsRef}
                className="env-layer absolute bottom-[10%] h-[50%] w-[150%] flex items-end opacity-60"
                style={{ filter: 'drop-shadow(0 -5px 10px rgba(255, 0, 255, 0.2))' }}
            >
                <div className="w-full h-full" 
                     style={{
                         backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 L25,50 L50,100 L75,30 L100,100 Z' fill='%232a004d' stroke='%23ff00ff' stroke-width='1.5' fill-opacity='0.4' stroke-linejoin='miter'/%3E%3C/svg%3E")`,
                         backgroundSize: '400px 100%',
                         backgroundRepeat: 'repeat-x'
                     }}
                ></div>
            </div>

            {/* Layer 3: Trees / Spikes (-35%) */}
            <div 
                ref={treesRef}
                className="env-layer absolute bottom-[5%] h-[35%] w-[200%] flex items-end opacity-90"
                style={{ filter: 'brightness(1.08)' }}
            >
                <div className="w-full h-full"
                     style={{
                         backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='60' viewBox='0 0 40 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,0 40,60 0,60' fill='%23001a1a' fill-opacity='0.9' stroke='%2300ffff' stroke-width='1'/%3E%3C/svg%3E")`,
                         backgroundSize: '120px 150px',
                         backgroundRepeat: 'repeat-x',
                         backgroundPosition: 'bottom'
                     }}
                ></div>
            </div>

            {/* Layer 4: Ultra Foreground Streaks (-50%) */}
            <div 
                ref={streaksRef}
                className="env-layer absolute inset-0 w-[250%] h-full flex flex-col justify-end pb-24 opacity-30 mix-blend-screen"
            >
                {/* Very wide soft light streaks representing fast foreground blur */}
                <div className="w-full h-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-xl mb-12 translate-x-[5%]"></div>
                <div className="w-full h-2 bg-gradient-to-r from-transparent via-pink-500 to-transparent blur-lg translate-x-[20%]"></div>
            </div>
            
            {/* Blend Overlay to eliminate flat gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#03010a] opacity-80 mix-blend-multiply"></div>
        </div>
    );
}
