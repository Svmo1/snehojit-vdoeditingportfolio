"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParallaxBackground from "./ParallaxBackground";
import CinemaBuilding from "./CinemaBuilding";
import EditingLab from "./EditingLab";
import StudioRoom from "./StudioRoom";
import PhoneBooth from "./PhoneBooth";
import StreetProp from "./StreetProp";
import PixelLandscape from "./PixelLandscape";
import ExitScreen from "./ExitScreen";

export default function Scene() {
    const sceneRef = useRef(null);
    const wrapperRef = useRef(null);
    const particlesRef = useRef([]);
    const lightSweepRef = useRef(null);
    const sceneGlowRef = useRef(null);
    const horizonGlowRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const sections = gsap.utils.toArray(".scene-section");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sceneRef.current,
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => wrapperRef.current
                    ? (wrapperRef.current.scrollWidth - window.innerWidth)
                    : "max",
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    // 1. Maintain Glow
                    if (sceneGlowRef.current) {
                        sceneGlowRef.current.style.filter = `saturate(${1 + self.progress * 0.4}) brightness(${1 + self.progress * 0.15})`;
                    }

                    // 2. Safety Curtain Logic
                    const exit = document.getElementById('exit-screen-overlay');
                    if (exit) {
                        // We hit 100% BLACK at 99% scroll. 
                        // This gives a 1% 'safety buffer' so the user never sees the black void.
                        const progress = (self.progress - 0.95) / (0.99 - 0.95);
                        const opacity = Math.min(Math.max(progress, 0), 1);

                        gsap.set(exit, { 
                            opacity: opacity, 
                            display: opacity > 0 ? 'flex' : 'none',
                            pointerEvents: opacity >= 0.9 ? 'auto' : 'none' 
                        });
                    }
                }
            }
        });

        tl.to(wrapperRef.current, {
            x: () => wrapperRef.current ? -(wrapperRef.current.scrollWidth - window.innerWidth) : 0,
            ease: "none"
        }, 0); 

        // Animate section modules as they scroll into view horizontally
        gsap.utils.toArray(".module-container").forEach((module) => {
            const type = module.dataset.animate;

            // Initial states
            if (type === "fade-scale") {
                gsap.set(module, { opacity: 0, scale: 0.8 });
            } else if (type === "slide-up") {
                gsap.set(module, { opacity: 0, y: 100 });
            } else if (type === "expand") {
                gsap.set(module, { opacity: 0, scaleX: 0.5, scaleY: 0.2 });
            } else if (type === "glitch") {
                gsap.set(module, { opacity: 0, skewX: 20 });
            }

            // Animation configuration based on type
            let toParams = {
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                scaleX: 1,
                scaleY: 1,
                skewX: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: module,
                    containerAnimation: tl,
                    start: "left 75%", // Triggers when module left edge is 75% across the screen
                    toggleActions: "play none none reverse"
                },
                overwrite: "auto"
            };

            if (type === "glitch") {
                toParams.ease = "elastic.out(1, 0.3)";
                toParams.duration = 1.5;
            } else if (type === "expand") {
                toParams.ease = "back.out(1.5)";
            }

            gsap.to(module, toParams);

            // Cinematic Event on Center
            ScrollTrigger.create({
                trigger: module,
                containerAnimation: tl,
                start: "left center",
                end: "right center",
                onEnter: () => activateCinematic(module, true),
                onLeave: () => activateCinematic(module, false),
                onEnterBack: () => activateCinematic(module, true),
                onLeaveBack: () => activateCinematic(module, false),
            });
        });

        function activateCinematic(module, isActive) {
            const cardInner = module.querySelector("div");
            
            if (isActive) {
                // 1. Target presence boost
                gsap.timeline({ overwrite: "auto" })
                    .to(module, { scale: 1.03, duration: 0.4, ease: "power2.out" })
                    .to(module, { scale: 1, duration: 0.4, ease: "power2.in", delay: 0.1 });
    
                if (cardInner) {
                    gsap.to(cardInner, {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                        duration: 0.4,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
                
                // 2. Soft Background Center Glow
                gsap.to(".center-glow", { opacity: 1, duration: 0.6, ease: "power2.out", overwrite: "auto" });
                
            } else {
                // Restore module smoothly
                if (cardInner) {
                    gsap.to(cardInner, {
                        boxShadow: '0 0 15px rgba(0,255,255,0.2), inset 0 0 5px rgba(0,255,255,0.1)',
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
                // Fade out center glow
                gsap.to(".center-glow", { opacity: 0, duration: 0.6, ease: "power2.inOut", overwrite: "auto" });
            }
        }

        // 2. Ambient Particle System drift
        particlesRef.current.forEach((p) => {
            if (!p) return;
            gsap.to(p, {
                y: () => `-=${window.innerHeight * 1.5}`, // Float upward solely
                opacity: 0,
                duration: 15 + Math.random() * 10,
                repeat: -1,
                delay: -Math.random() * 10,
                ease: "none",
                overwrite: "auto"
            });
            gsap.to(p, {
                opacity: 0.4 + Math.random() * 0.4,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                overwrite: "auto"
            });
        });

        // 3. Dynamic Light Sweep
        if (lightSweepRef.current) {
            gsap.fromTo(lightSweepRef.current,
                { x: "-100vw", opacity: 0 },
                {
                    x: "100vw",
                    opacity: 0.05,
                    duration: 6,
                    repeat: -1,
                    repeatDelay: 8 + Math.random() * 2,
                    ease: "power2.inOut",
                    overwrite: "auto"
                }
            );
        }

        // 5. Horizon Glow Pulse
        if (horizonGlowRef.current) {
            gsap.to(horizonGlowRef.current, {
                opacity: 0.9,
                scaleY: 1.3,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                overwrite: "auto"
            });
        }

        if (glowRef.current) {
            gsap.fromTo(glowRef.current,
                { xPercent: -5, yPercent: -3 },
                {
                    xPercent: 5,
                    yPercent: 3,
                    duration: 10,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    overwrite: "auto"
                }
            );
        }

        // Deferred refresh — ensures late-loading images (StudioRoom etc.) are measured
        const refreshTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        // Immediate refresh to catch initial measurements
        ScrollTrigger.refresh();

        const handleResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            clearTimeout(refreshTimer);
            window.removeEventListener("resize", handleResize);
            if (tl) tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section ref={sceneRef} className="w-full h-screen overflow-hidden relative" style={{ height: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
            <div ref={sceneGlowRef} className="absolute inset-0 w-full h-full">

                {/* Parallax Background Layers */}
                <ParallaxBackground />

                {/* Ambient Particles (2) - Low Density */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const colors = ['bg-white', 'bg-cyan-300', 'bg-pink-400'];
                        const color = colors[i % colors.length];
                        return (
                            <div key={i} ref={el => particlesRef.current[i] = el}
                                className={`env-layer absolute w-1 h-1 rounded-full ${color} opacity-0 mix-blend-screen shadow-[0_0_10px_currentColor]`}
                                style={{
                                    left: `${5 + Math.random() * 80}%`,
                                    bottom: `-10%`
                                }}
                            />
                        );
                    })}
                </div>

                {/* Dynamic Light Sweep (3) */}
                <div ref={lightSweepRef} className="env-layer absolute top-0 bottom-0 w-[40vw] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 mix-blend-overlay z-[5] -skew-x-[25deg] pointer-events-none"></div>

                {/* Soft Center Glow Illusion */}
                <div className="center-glow absolute inset-0 z-[15] pointer-events-none opacity-0 flex items-center justify-center">
                    <div className="w-[80vw] h-[80vh] rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(150, 200, 255, 0.05) 0%, transparent 50%)' }}></div>
                </div>

                {/* The Horizontal Scrolling Track */}
                <div
                    ref={wrapperRef}
                    className="flex flex-row items-end h-full w-max flex-nowrap"
                >
                    {/* Ambient Light Glow Layer */}
                    <div
                        ref={glowRef}
                        className="pointer-events-none absolute w-[120%] h-[120%] top-[-10%] left-[-10%] z-[5]"
                        style={{
                            background: 'radial-gradient(circle at 30% 40%, rgba(255,0,255,0.12), transparent 60%), radial-gradient(circle at 70% 60%, rgba(0,255,255,0.10), transparent 60%)',
                            filter: 'blur(120px)',
                            opacity: 0.6
                        }}
                    ></div>

                    {/* Intro spacing before first building */}
                    <div className="w-screen shrink-0 h-full flex items-end justify-center pb-8">
                        <StreetProp type="billboard" />
                    </div>

                    {/* Buildings / Sections */}
                    <CinemaBuilding />

                    <PixelLandscape type="cyber-grid" />
                    <StreetProp type="lamp" />

                    <EditingLab />

                    <PixelLandscape type="retro-mountains" />
                    <StreetProp type="sign" />

                    <StudioRoom />

                    <StreetProp type="lamp" />
                    <div className="w-[30vw] shrink-0 h-full"></div>

                    <PhoneBooth />

                    {/* Outro spacing */}
                    <div className="w-[50vw] shrink-0 h-full" id="final-dead-zone" />
                </div>
                {/* Ground Layer and 5. Horizon Glow */}
                <div className="absolute bottom-0 w-full h-20 bg-neutral-950 border-t border-neon-green/30 z-20 flex">
                    <div ref={horizonGlowRef} className="env-layer absolute -top-[12px] left-0 w-full h-[24px] bg-neon-green/20 blur-md mix-blend-screen opacity-50"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,255,0,0.15) 40px, rgba(0,255,0,0.1) 80px)' }}></div>
                </div>

                {/* Filmic Color Gradients */}
                <div className="absolute inset-0 z-[18] pointer-events-none mix-blend-color" style={{ background: 'linear-gradient(to bottom, rgba(0, 50, 100, 0.15), rgba(200, 50, 150, 0.05))' }}></div>

                {/* Cinematic Vignette Focus (7) */}
                <div className="pointer-events-none absolute inset-0 z-[60] bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,5,0.85)_100%)]"></div>
            </div>
            
            <ExitScreen />
        </section>
    );
}
