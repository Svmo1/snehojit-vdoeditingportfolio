"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";

export default function IntroScreen({ onStart }) {

    useEffect(() => {
        gsap.to(".drift-bg", {
            x: "-=20",
            y: "+=15",
            rotation: 1,
            duration: 15,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }, []);

    const containerRef = useRef(null);
    const cabinetRef = useRef(null);
    const screenRef = useRef(null);
    const coinRef = useRef(null);
    const audioContentRef = useRef(null);
    const idleWrapperRef = useRef(null);
    const idleTweenRef = useRef(null);


    const [isStarting, setIsStarting] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [showCoin, setShowCoin] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [hasInteracted, setHasInteracted] = useState(false);
    const [cabinetVisible, setCabinetVisible] = useState(false);
    const [lightsOn, setLightsOn] = useState({ marquee: false, sides: false, screen: false });
    const [showCabinetOutline, setShowCabinetOutline] = useState(false);

    // New states for the cinematic boot sequence
    const [bootText, setBootText] = useState("");
    const [isGlitching, setIsGlitching] = useState(false);
    const [showPortal, setShowPortal] = useState(false);
    const [hasStartedAudio, setHasStartedAudio] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const introVideoRef = useRef(null);
    const ambienceAudioRef = useRef(null);

    // Audio unlock gate state
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [soundPhase, setSoundPhase] = useState('enable'); // 'enable' | 'booting' | 'ready'
    // Loading bar refs (direct DOM updates to avoid re-render lag)
    const loadingBarRef = useRef(null);
    const loadingPctRef = useRef(null);
    const bootContainerRef = useRef(null);
    const bootHumRef = useRef(null); // Boot hum oscillator nodes

    // Attract mode text loop
    useEffect(() => {
        if (!hasInteracted) {
            gsap.to(".drift-bg", { scale: 1.03, duration: 10, ease: "sine.inOut", yoyo: true, repeat: -1 });
            gsap.to(".arcade-silhouettes", { scale: 1.02, duration: 15, ease: "sine.inOut", yoyo: true, repeat: -1 });
        }
    }, [hasInteracted]);

    // Global Audio Context Unlocker -- Ensures sounds play after refresh
    const initGlobalAudio = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!audioContentRef.current && AudioContext) {
                audioContentRef.current = new AudioContext();
            }
            if (audioContentRef.current && audioContentRef.current.state === "suspended") {
                audioContentRef.current.resume();
            }
        } catch (e) {
            console.error("Audio init error:", e);
        }
    }, []);


    useEffect(() => {
        const attemptAutoPlay = async () => {
            // FIX 5: Only attempt autoplay if audio has already been unlocked by user
            if (!audioUnlocked) return;
            initGlobalAudio();
            if (audioContentRef.current && audioContentRef.current.state === "suspended") {
                try {
                    await audioContentRef.current.resume();
                } catch (e) {
                    console.error("Auto-resume failed:", e);
                }
            }
            if (ambienceAudioRef.current) {
                ambienceAudioRef.current.volume = 0.05;
                try {
                    await ambienceAudioRef.current.play();
                    setHasStartedAudio(true);
                } catch (e) {
                    console.log("Autoplay blocked, waiting for interaction");
                }
            }
        };

        attemptAutoPlay();

        const handleGlobalInteraction = () => {
            // FIX 2: Only allow global interaction to trigger audio AFTER user has unlocked it
            if (!audioUnlocked) return;
            // FIX 2: Prevent duplicate initialization via singleton
            if (window.__ambientAudio) return;

            initGlobalAudio();

            // Start the dedicated MP3 recording for ambience
            if (ambienceAudioRef.current) {
                ambienceAudioRef.current.volume = 0.05;
                if (ambienceAudioRef.current.paused) {
                    ambienceAudioRef.current.play().catch(e => console.error("Ambience play failed:", e));
                }
            }

            setHasStartedAudio(true);

            window.removeEventListener('pointerdown', handleGlobalInteraction);
            window.removeEventListener('click', handleGlobalInteraction);
            window.removeEventListener('touchstart', handleGlobalInteraction);
            window.removeEventListener('keydown', handleGlobalInteraction);
        };

        window.addEventListener('pointerdown', handleGlobalInteraction, { passive: true });
        window.addEventListener('click', handleGlobalInteraction, { passive: true });
        window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });
        window.addEventListener('keydown', handleGlobalInteraction, { passive: true });

        return () => {
            window.removeEventListener('pointerdown', handleGlobalInteraction);
            window.removeEventListener('click', handleGlobalInteraction);
            window.removeEventListener('touchstart', handleGlobalInteraction);
            window.removeEventListener('keydown', handleGlobalInteraction);
        };
    }, [initGlobalAudio, audioUnlocked]);

    const attractPhrases = useMemo(() => ["INSERT COIN", "SNEHOJIT EDITING", "VIDEO EDITOR", "EDITING PORTFOLIO", "CINEMATIC STORYTELLING"], []);
    const [attractIndex, setAttractIndex] = useState(0);
    const [showAttract, setShowAttract] = useState(true);

    useEffect(() => {
        if (isStarting || !cabinetVisible) return;
        const interval = setInterval(() => {
            setShowAttract(false);
            setTimeout(() => {
                setAttractIndex(prev => (prev + 1) % attractPhrases.length);
                setShowAttract(true);
            }, 500);
        }, 2200);
        return () => clearInterval(interval);
    }, [isStarting, cabinetVisible, attractPhrases.length]);

    // Cabinet visible: nothing to do for idle here anymore
    useEffect(() => {
        return () => {
            // Cleanup: kill idle tween if cabinet unmounts
            if (idleTweenRef.current) idleTweenRef.current.kill();
        };
    }, [cabinetVisible, isStarting]);


    const handleMouseMove = useCallback((e) => {
        if (!isStarting) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    }, [isStarting]);


    // Phase 1 Hover Sounds
    const playHoverSnehojit = useCallback(() => {
        if (!hasStartedAudio || !audioContentRef.current) return;
        const ctx = audioContentRef.current;
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => { });
        }

        try {
            const osc = ctx.createOscillator();
            // Soft synth blip
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, [hasStartedAudio]);

    const playHoverPortfolio = useCallback(() => {
        if (!hasStartedAudio || !audioContentRef.current) return;
        const ctx = audioContentRef.current;
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => { });
        }

        try {
            const osc = ctx.createOscillator();
            // Deeper arcade tone
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 600;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
            osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, [hasStartedAudio]);

    const playHoverPowerOn = useCallback(() => {
        if (!hasStartedAudio || !audioContentRef.current) return;
        const ctx = audioContentRef.current;
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => { });
        }

        try {
            const osc = ctx.createOscillator();
            // Subtle CRT flicker sound
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(40, ctx.currentTime);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, [hasStartedAudio]);

    // Phase 1 Interaction Sound
    const playPhase1Click = useCallback(() => {
        if (!audioContentRef.current) return;
        try {
            const ctx = audioContentRef.current;
            // 1. Arcade Coin Chime
            const osc1 = ctx.createOscillator();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
            osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);
            osc1.onended = () => { osc1.disconnect(); gain1.disconnect(); };

            // 2. CRT Power Surge
            const osc2 = ctx.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(50, ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.4, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.2);
            osc2.onended = () => { osc2.disconnect(); gain2.disconnect(); };
        } catch (e) { }
    }, []);

    // Phase 3 Sounds
    const playJoystickSound = useCallback(() => {
        if (!audioContentRef.current) return;
        try {
            const ctx = audioContentRef.current;
            const osc = ctx.createOscillator();
            // Mechanical arcade stick click
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.02);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, []);

    const playButtonSound = useCallback(() => {
        if (!audioContentRef.current) return;
        try {
            const ctx = audioContentRef.current;
            const osc = ctx.createOscillator();
            // Thunky arcade button click
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, []);

    const playCabinetStartupSound = useCallback(() => {
        if (!audioContentRef.current) return;
        try {
            const ctx = audioContentRef.current;
            // Soft arcade machine boot sound (soft clunk + very gentle rising tone)

            // 1. Soft Clunk
            const clunkOsc = ctx.createOscillator();
            clunkOsc.type = 'square';
            clunkOsc.frequency.setValueAtTime(80, ctx.currentTime);
            clunkOsc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.15);
            const clunkGain = ctx.createGain();
            clunkGain.gain.setValueAtTime(0.15, ctx.currentTime);
            clunkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            clunkOsc.connect(clunkGain);
            clunkGain.connect(ctx.destination);
            clunkOsc.start(ctx.currentTime);
            clunkOsc.stop(ctx.currentTime + 0.15);
            clunkOsc.onended = () => { clunkOsc.disconnect(); clunkGain.disconnect(); };

            // 2. Gentle Rising Tone
            const sweepOsc = ctx.createOscillator();
            sweepOsc.type = 'sine';
            sweepOsc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
            sweepOsc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
            const sweepGain = ctx.createGain();
            sweepGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
            sweepGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
            sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            sweepOsc.connect(sweepGain);
            sweepGain.connect(ctx.destination);
            sweepOsc.start(ctx.currentTime + 0.1);
            sweepOsc.stop(ctx.currentTime + 0.8);
            sweepOsc.onended = () => { sweepOsc.disconnect(); sweepGain.disconnect(); };
        } catch (e) { }
    }, []);

    const playPortalSound = useCallback(() => {
        if (!audioContentRef.current) return;
        try {
            const ctx = audioContentRef.current;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 1.0);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 1.0);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.2);
            osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
        } catch (e) { }
    }, []);


    // Play a retro coin sound and mechanical startup using Web Audio API
    const playCoinDropSound = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!audioContentRef.current && AudioContext) {
                audioContentRef.current = new AudioContext();
            }
            if (audioContentRef.current && audioContentRef.current.state === "suspended") {
                audioContentRef.current.resume();
            }
            if (audioContentRef.current) {
                const ctx = audioContentRef.current;

                // --- 1. Metal Drop Clink ---
                const dropOsc = ctx.createOscillator();
                dropOsc.type = 'triangle';
                dropOsc.frequency.setValueAtTime(400, ctx.currentTime);
                dropOsc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
                const dropGain = ctx.createGain();
                dropGain.gain.setValueAtTime(0.2, ctx.currentTime);
                dropGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                dropOsc.connect(dropGain);
                dropGain.connect(ctx.destination);
                dropOsc.start(ctx.currentTime);
                dropOsc.stop(ctx.currentTime + 0.15);
                dropOsc.onended = () => { dropOsc.disconnect(); dropGain.disconnect(); };

                // --- 2. Coin Accept Chime ---
                setTimeout(() => {
                    const osc1 = ctx.createOscillator();
                    osc1.type = 'square';
                    osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
                    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
                    const gain1 = ctx.createGain();
                    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
                    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc1.connect(gain1);
                    gain1.connect(ctx.destination);
                    osc1.start(ctx.currentTime);
                    osc1.stop(ctx.currentTime + 0.4);
                    osc1.onended = () => { osc1.disconnect(); gain1.disconnect(); };

                    const osc2 = ctx.createOscillator();
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1);
                    osc2.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);
                    const gain2 = ctx.createGain();
                    gain2.gain.setValueAtTime(0, ctx.currentTime);
                    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
                    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.start(ctx.currentTime + 0.1);
                    osc2.stop(ctx.currentTime + 0.4);
                    osc2.onended = () => { osc2.disconnect(); gain2.disconnect(); };
                }, 150); // Delay chime slightly after the physical drop clink
            }
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    }, []);

    const handleStart = useCallback((e) => {
        if (isStarting) return;
        setIsStarting(true);

        // Stop following mouse

        let slotCenterX = window.innerWidth / 2;
        let slotTopY = window.innerHeight * 0.8;

        if (e && e.target) {
            const rect = e.target.getBoundingClientRect();
            slotCenterX = rect.left + rect.width / 2;
            slotTopY = rect.top;
        }

        playCoinDropSound();
        if (idleTweenRef.current) idleTweenRef.current.kill();

        const tl = gsap.timeline({
            onComplete: () => {
                if (onStart) onStart();
            }
        });

        // 1. Drop the coin into the slot
        tl.to(coinRef.current, {
            x: slotCenterX,
            y: slotTopY - 20,
            duration: 0.15,
            ease: "power2.out"
        }).to(coinRef.current, {
            y: slotTopY + 20,
            scale: 0.1,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        });

        // Cabinet vibration on coin drop
        tl.to(cabinetRef.current, {
            x: "+=5",
            y: "+=2",
            duration: 0.05,
            yoyo: true,
            repeat: 7,
            ease: "sine.inOut"
        }, "-=0.1").set(cabinetRef.current, { x: 0, y: 0 });

        // 2. Machine Boot Sequence (Flicker & Text)
        tl.to(screenRef.current, {
            backgroundColor: "#ffffff",
            duration: 0.05,
            repeat: 3,
            yoyo: true,
            ease: "none"
        }, "+=0.2").set(screenRef.current, {
            backgroundColor: "#080c10",
            boxShadow: "0 0 50px rgba(0,255,255,0.6)",
            filter: "brightness(1)",
        }).add(() => setBootText("LOADING SYSTEM..."))
            .to({}, { duration: 0.8 }) // 0.8s load
            .add(() => setBootText("INITIALIZING DISPLAY..."))
            .to({}, { duration: 0.6 }) // 0.6s init
            .add(() => setBootText("READY"));

        // 3. Glitch effect before portal
        tl.add(() => setIsGlitching(true), "+=0.3")
            .to({}, { duration: 0.2 }) // Brief glitch wait
            .add(() => {
                setIsGlitching(false);
                setShowPortal(true);
            });

        // 4. Portal Expansion / Tunnel Dive
        tl.to(screenRef.current, {
            backgroundColor: "#ddffff",
            boxShadow: "0 0 150px rgba(0,255,255,1)",
            duration: 0.1
        })
            .add(() => playPortalSound(), "<") // Play sweeping portal transition sound
            .to(cabinetRef.current, {
                rotationX: 0,
                rotationY: 0,
                scale: 25, // Massive scale to fly "into" the screen
                y: "40%",
                duration: 1.2,
                ease: "power2.in"
            }, "<").to(containerRef.current, {
                opacity: 0,
                duration: 0.3
            }, "-=0.2");
    }, [isStarting, onStart, playCoinDropSound, playPortalSound]);

    // Calculate dynamic 3D tilt based on mouse position
    let tiltX = 0;
    let tiltY = 0;

    if (isMounted && typeof window !== "undefined") {
        tiltX = (mousePos.y / window.innerHeight - 0.5) * 15; // Increased tilt
        tiltY = (mousePos.x / window.innerWidth - 0.5) * -25; // Increased tilt
    }


    // ── ENABLE SOUND handler ──
    const handleEnableSound = useCallback(() => {
        // FIX 6: Singleton guard — bail if already unlocked OR audio already exists
        if (audioUnlocked || window.__ambientAudio) return;
        setAudioUnlocked(true);

        // A. Play arcade SFX immediately (reuse existing blip)
        initGlobalAudio();
        playPhase1Click();

        // B. Create global audio singleton
        window.__ambientAudio = new Audio('/audio/arcade-ambience.mp3');
        window.__ambientAudio.loop = true;
        window.__ambientAudio.volume = 0;

        const audio = window.__ambientAudio;

        // FIX 1: Better error logging on play
        audio.play().catch((err) => {
            console.warn('Audio play failed:', err);
        });

        // Sync ambienceAudioRef so existing resume/pause logic keeps working
        ambienceAudioRef.current = audio;
        setHasStartedAudio(true);

        // FIX 4: Micro delay (50ms) before showing SYSTEM BOOTING...
        setTimeout(() => {
            setSoundPhase('booting');

            // ── Boot hum: soft triangle oscillator, plays only during SYSTEM BOOTING ──
            try {
                const ctx = audioContentRef.current;
                if (ctx && !bootHumRef.current) {
                    const humOsc = ctx.createOscillator();
                    const humGain = ctx.createGain();

                    humOsc.type = 'triangle';
                    humOsc.frequency.setValueAtTime(180, ctx.currentTime);
                    // Slowly sweep 180 → 240 → 180 Hz over 1.2s for an "alive" feel
                    humOsc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.6);
                    humOsc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 1.2);

                    // Fade in: 0 → 0.03 over 0.2s
                    humGain.gain.setValueAtTime(0, ctx.currentTime);
                    humGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.2);

                    humOsc.connect(humGain);
                    humGain.connect(ctx.destination);
                    humOsc.start(ctx.currentTime);

                    // Store refs for clean teardown
                    bootHumRef.current = { osc: humOsc, gain: humGain };
                }
            } catch (e) { /* silently ignore if audio ctx not ready */ }

            // Animate loading bar + percentage + audio volume all from one GSAP tween
            const progress = { value: 0 };
            gsap.to(progress, {
                value: 100,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate() {
                    const pct = Math.round(progress.value);
                    // Direct DOM update — no React re-render needed
                    if (loadingBarRef.current) {
                        loadingBarRef.current.style.width = pct + '%';
                    }
                    if (loadingPctRef.current) {
                        loadingPctRef.current.textContent = pct + '%';
                    }
                    // Sync audio volume to loading progress (0 → 0.18)
                    audio.volume = (pct / 100) * 0.18;
                },
                onComplete() {
                    // ── Fade out and stop the boot hum cleanly ──
                    try {
                        if (bootHumRef.current) {
                            const { osc, gain } = bootHumRef.current;
                            const ctx = audioContentRef.current;
                            if (ctx) {
                                gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
                                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                                osc.stop(ctx.currentTime + 0.2);
                                osc.onended = () => { osc.disconnect(); gain.disconnect(); };
                            }
                            bootHumRef.current = null;
                        }
                    } catch (e) { /* ignore */ }

                    // Glow pulse on boot container
                    if (bootContainerRef.current) {
                        gsap.fromTo(
                            bootContainerRef.current,
                            { scale: 1 },
                            {
                                scale: 1.05, duration: 0.15, ease: 'power1.out',
                                yoyo: true, repeat: 1,
                                onComplete: () => setSoundPhase('ready')
                            }
                        );
                    } else {
                        setSoundPhase('ready');
                    }
                }
            });
        }, 50);
    }, [audioUnlocked, initGlobalAudio, playPhase1Click]);

    // Multi-stage cinematic Boot sequence
    const handleInitialInteraction = useCallback(() => {
        if (hasInteracted) return;
        setHasInteracted(true);

        // ── Phase 1 Click sound: fires immediately on click ──
        playPhase1Click();

        const tl = gsap.timeline();

        // Initialize elements
        gsap.set(introVideoRef.current, { opacity: 0, scale: 0.95, filter: 'brightness(3) contrast(1.2)' });
        gsap.set('#crt-flash-layer', {
            height: '100%', top: '0',
            background: 'radial-gradient(circle, #ffffff 0%, #ccffff 50%, #00aaff 100%)',
            boxShadow: 'none', opacity: 0, scale: 1,
            mixBlendMode: 'screen',
            transformOrigin: 'center center'
        });

        // 1. CRT glow ramp-up
        // Duration: ~350ms, Ease: ease-in-out
        tl.to('#standby-text', {
            filter: 'brightness(4) contrast(1.5) blur(2px)',
            scale: 1.05,
            duration: 0.35,
            ease: 'power1.inOut'
        }, 0);

        // 2. White flash
        // Duration: ~120ms, Ease: ease-out
        tl.to('#crt-flash-layer', {
            opacity: 1,
            duration: 0.12,
            ease: 'power1.out'
        }, 0.28); // Blends into the glow peak

        // Stop ambient hum around the flash peak
        tl.add(() => {
            if (ambienceAudioRef.current) {
                ambienceAudioRef.current.pause();
            }
        }, 0.35);

        // 3. Ripple distortion expansion
        // Duration: ~450ms, Ease: power2.out
        tl.to('#crt-flash-layer', {
            scale: 3.5,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out'
        }, 0.35); // Starts slightly before flash finishes (flash finishes 0.40)

        // 4. Video emergence
        // Duration: ~500ms, Ease: power2.inOut
        tl.add(() => {
            setIsVideoPlaying(true);
            if (introVideoRef.current) {
                introVideoRef.current.currentTime = 0;
                introVideoRef.current.play().catch(e => console.error("Video play failed:", e));
            }
        }, 0.45); // Start playback just as ripple becomes prominent

        tl.to(introVideoRef.current, {
            opacity: 1,
            scale: 1,
            filter: 'brightness(1) contrast(1)',
            duration: 0.5,
            ease: 'power2.inOut'
        }, 0.45);

        // Smoothly crossfade standby overlay out behind the video
        // This ensures no blank background frame is shown
        tl.to("#standby-overlay", {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut'
        }, 0.55);

    }, [hasInteracted, playPhase1Click]);

    // Stage 3 - Triggered when the intro video ends
    const handleVideoEnded = useCallback(() => {
        const tl = gsap.timeline();

        // Resume AudioContext so the hover clicks start again without recreating
        if (audioContentRef.current && audioContentRef.current.state === "suspended") {
            audioContentRef.current.resume().catch(e => console.error(e));
        }

        // Resume the MP3 ambient track
        if (ambienceAudioRef.current) {
            ambienceAudioRef.current.play().catch(e => console.error("Ambience resume failed:", e));
        }

        // Fade out video
        tl.to(introVideoRef.current, { opacity: 0, duration: 0.4 });
        tl.add(() => setIsVideoPlaying(false), "+=0.1");

        // Cabinet materializes. Anchor all timing from this label.
        tl.add(() => {
            setCabinetVisible(true);
            setShowCabinetOutline(false);
            playCabinetStartupSound();
            gsap.set('.arcade-button', { filter: 'brightness(0)' });
            gsap.set('.arcade-joystick', { filter: 'brightness(0)' });
        }, "+=0.05");
        tl.addLabel("cabinetStart");

        // Overlay fades out simultaneously
        tl.to("#standby-overlay", { opacity: 0, duration: 0.35, ease: "power1.inOut" }, "cabinetStart");

        // Cabinet body fades in
        tl.fromTo(cabinetRef.current,
            { y: "10vh", scale: 0.9, opacity: 0 },
            { y: "0vh", scale: 1.0, opacity: 1, duration: 0.35, ease: "power3.out" },
            "cabinetStart"
        );

        // Screen glow: 200ms after cabinet appears
        tl.add(() => setLightsOn(prev => ({ ...prev, screen: true })), "cabinetStart+=0.2");
        // REMOVED: tl.fromTo(screenRef.current, { filter: 'brightness(0)' }... as it was zeroing out the screen visibility.

        // INSERT COIN text: 300ms after cabinet appears
        tl.add(() => {
            gsap.fromTo('.insert-coin-text', { opacity: 0 }, { opacity: 1, duration: 0.2 });
            setShowCoin(true);
        }, "cabinetStart+=0.3");

        // Marquee and sides (parallel, cosmetic)
        tl.add(() => setLightsOn(prev => ({ ...prev, marquee: true })), "cabinetStart+=0.2");
        tl.add(() => setLightsOn(prev => ({ ...prev, sides: true })), "cabinetStart+=0.3");

        // Joystick & Buttons (parallel, cosmetic, non-blocking)
        tl.fromTo('.arcade-joystick',
            { filter: 'brightness(0)' },
            { filter: 'brightness(1)', duration: 0.15 },
            "cabinetStart+=0.2"
        );
        tl.fromTo('.arcade-button',
            { filter: 'brightness(0)' },
            { filter: 'brightness(1)', duration: 0.15, stagger: 0.05 },
            "cabinetStart+=0.25"
        );

    }, [playCabinetStartupSound]);

    // Also support "Enter" key

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && !isStarting) {
                if (!hasInteracted) {
                    handleInitialInteraction();
                    return;
                }
                // Approximate a center slot position if pressed via keyboard
                setMousePos({ x: window.innerWidth / 2, y: window.innerHeight * 0.8 });
                setTimeout(() => {
                    handleStart();
                }, 50);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isStarting, hasInteracted, handleInitialInteraction, handleStart]);

    const portalFragments = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            size: `${Math.random() * 20 + 5}px`,
            color: ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff4400'][Math.floor(Math.random() * 5)],
            animationDuration: `${Math.random() * 0.8 + 0.4}s`,
            animationDelay: `${Math.random() * 0.3}s`,
        }));
    }, []);

    return (
        <section
            ref={containerRef}
            className={`w-full h-screen bg-black relative overflow-hidden flex items-center justify-center ${showCoin ? 'cursor-none' : ''}`}
            onMouseMove={handleMouseMove}
        >
            {/* Intro Video Layer (above standby, below arcade scene) */}
            <video
                ref={introVideoRef}
                src="/intro/intro-video.mp4"
                className="absolute inset-0 w-full h-full object-cover z-[250] pointer-events-none"
                style={{ opacity: 0 }}
                onEnded={handleVideoEnded}
                playsInline
                preload="auto"
            />

            {/* Ambient Background MP3 */}
            <audio
                ref={ambienceAudioRef}
                src="/audio/arcade-ambience.mp3"
                loop
                preload="auto"
            />

            {/* ══════════════════════════════════════════════════
                ARCADE STANDBY — CRT image overlay version
            ══════════════════════════════════════════════════ */}
            {(!hasInteracted && !isVideoPlaying && !cabinetVisible) && (
                <div
                    id="standby-overlay"
                    className="absolute inset-0 z-[200] overflow-hidden"
                    style={{ background: '#000000', pointerEvents: isVideoPlaying ? 'none' : 'auto' }}
                >
                    {/* â”€â”€ All keyframes & CSS â”€â”€ */}
                    <style>{`
                        @keyframes crtFlickerWhole {
                            0%, 98.5%, 100% { opacity: 1; filter: brightness(1); }
                            99% { opacity: 0.95; filter: brightness(0.85); }
                        }
                        @keyframes scanlineSweep {
                            0%   { transform: translateY(-100vh); }
                            100% { transform: translateY(100vh); }
                        }
                        @keyframes lightningSpark1 {
                            0%, 96%, 100% { filter: brightness(1); }
                            98% { filter: brightness(1.3) drop-shadow(0 0 4px rgba(255,200,0,0.4)); }
                        }
                        @keyframes lightningSpark2 {
                            0%, 91%, 95%, 100% { filter: brightness(1); }
                            93% { filter: brightness(1.3) drop-shadow(0 0 4px rgba(255,200,0,0.4)); }
                        }
                        @keyframes scanBandMove {
                            from { background-position: 0 0; }
                            to   { background-position: 0 120px; }
                        }
                        @keyframes fineScanMove {
                            from { background-position: 0 0; }
                            to   { background-position: 0 6px; }
                        }
                        @keyframes titleGlowPulse {
                            0%, 100% {
                                filter: drop-shadow(0 0 10px rgba(0,220,255,0.5))
                                        drop-shadow(0 4px 15px rgba(255,100,0,0.3));
                            }
                            50% {
                                filter: drop-shadow(0 0 18px rgba(0,245,255,0.8))
                                        drop-shadow(0 6px 25px rgba(255,120,0,0.5));
                            }
                        }
                        @keyframes subGlowPulse {
                            0%,100% { text-shadow: 0 0 8px #00e8ff, 0 0 18px rgba(0,200,255,0.5); }
                            50%     { text-shadow: 0 0 18px #00ffff, 0 0 40px rgba(0,220,255,0.9), 0 0 60px rgba(0,150,255,0.45); }
                        }
                        @keyframes arcadeBlink {
                            0%, 100% { opacity: 0; }
                            50%  { opacity: 1; }
                        }
                        @keyframes flameDance {
                            0%   { transform: scaleY(1)    scaleX(1)    translateY(0px); }
                            25%  { transform: scaleY(1.12) scaleX(0.94) translateY(-4px); }
                            50%  { transform: scaleY(0.90) scaleX(1.06) translateY(3px); }
                            75%  { transform: scaleY(1.09) scaleX(0.96) translateY(-2px); }
                            100% { transform: scaleY(1)    scaleX(1)    translateY(0px); }
                        }
                        @keyframes flameDance2 {
                            0%   { transform: scaleY(1)    scaleX(1)    translateY(0px)  rotate(-2deg); }
                            33%  { transform: scaleY(1.18) scaleX(0.90) translateY(-5px) rotate(2.5deg); }
                            66%  { transform: scaleY(0.86) scaleX(1.10) translateY(4px)  rotate(-1.5deg); }
                            100% { transform: scaleY(1)    scaleX(1)    translateY(0px)  rotate(-2deg); }
                        }
                        @keyframes screenAmbient {
                            0%,100% { opacity:0.04; }
                            50%     { opacity:0.08; }
                        }
                        @keyframes crtFlash {
                            0%   { opacity:0; }
                            15%  { opacity:0.95; }
                            40%  { opacity:0.6; }
                            60%  { opacity:0.85; }
                            100% { opacity:0; }
                        }
                        .crt-title-gradient {
                            background: linear-gradient(180deg,
                                #00ffff  0%,
                                #00e0ff 16%,
                                #00aaff 32%,
                                #ff9900 55%,
                                #ff4400 75%,
                                #cc2200 100%
                            );
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }
                        /* Element-specific hover boosts */
                        .crt-title-area:hover {
                            filter: drop-shadow(0 0 30px rgba(0,245,255,1))
                                    drop-shadow(0 0 60px rgba(0,200,255,0.75))
                                    drop-shadow(0 12px 38px rgba(255,120,0,0.75))
                                    brightness(1.1) contrast(1.05) !important;
                        }
                        #standby-powerOn:hover {
                            text-shadow: 0 0 18px #ffffff, 0 0 36px rgba(0,220,255,1) !important;
                            filter: brightness(1.1) !important;
                        }
                        /* Legacy compat */
                        .pf-gradient-text {
                            background: linear-gradient(180deg, #00ffff 0%, #00ddff 18%, #ff9900 52%, #ff4400 75%, #cc2200 100%);
                            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                        }
                        @keyframes crtTextFlicker {
                          0% { opacity: 1; filter: brightness(1); }
                          5% { opacity: 0.9; filter: brightness(1.2); }
                          10% { opacity: 1; filter: brightness(1); }
                          15% { opacity: 0.85; filter: brightness(0.8); }
                          20% { opacity: 1; filter: brightness(1); }
                          100% { opacity: 1; filter: brightness(1); }
                        }
                        @keyframes neonFlicker {
                          0%, 92%, 100% { opacity: 1; text-shadow: 0 0 8px #00ffff, 0 0 20px rgba(0,255,255,0.6); }
                          93% { opacity: 0.5; text-shadow: none; }
                          95% { opacity: 0.9; text-shadow: 0 0 4px #00ffff; }
                          97% { opacity: 0.6; text-shadow: none; }
                        }
                        @keyframes glowPulse {
                          0%, 100% { text-shadow: 0 0 8px #00ffff, 0 0 20px rgba(0,255,255,0.4); }
                          50% { text-shadow: 0 0 20px #00ffff, 0 0 50px rgba(0,255,255,0.9), 0 0 80px rgba(0,200,255,0.4); }
                        }
                        @keyframes scanSweep {
                          0% { transform: translateY(-100%); opacity: 0.35; }
                          100% { transform: translateY(100%); opacity: 0.1; }
                        }
                        @keyframes scalePulse {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.04); }
                        }
                        @keyframes scanSweepH {
                          0%   { transform: translateX(-100%); }
                          100% { transform: translateX(200%); }
                        }
                    `}</style>

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                        LAYER A: Screen content â€” behind the CRT frame
                    â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â••â•â•â•â•â•â•â•â•â•â•â• */}
                    <div
                        id="standby-text"
                        style={{
                            position: 'absolute', inset: 0,
                            /*
                             * CRT barrel curvature simulation:
                             * border-radius clips the entire layer (text + scanlines + bg)
                             * to a rounded rect matching a real curved CRT tube face.
                             * perspective() + scale adds a very slight centre-bulge feeling.
                             */
                            borderRadius: '18% / 14%',
                            transform: 'perspective(700px) scale(1.06)',
                            animation: 'crtFlickerWhole 8s infinite',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: '#00000c',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Thick sweeping horizontal bands (ref image 2) */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(
                                0deg,
                                transparent           0px,
                                transparent           28px,
                                rgba(0,180,255,0.06)  28px,
                                rgba(0,180,255,0.06)  34px,
                                transparent           34px,
                                transparent           52px,
                                rgba(0,140,255,0.038) 52px,
                                rgba(0,140,255,0.038) 56px,
                                transparent           56px,
                                transparent           80px,
                                rgba(0,100,200,0.030) 80px,
                                rgba(0,100,200,0.030) 83px,
                                transparent           83px,
                                transparent           120px
                            )`,
                            backgroundSize: '100% 120px',
                            animation: 'scanBandMove 4s linear infinite',
                            mixBlendMode: 'screen',
                        }}></div>

                        {/* Fine phosphor scanlines */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(
                                0deg,
                                transparent              0px,
                                transparent              3px,
                                rgba(0,0,0,0.30)         3px,
                                rgba(0,0,0,0.30)         4px,
                                transparent              4px,
                                transparent              5px,
                                rgba(0,200,255,0.022)    5px,
                                rgba(0,200,255,0.022)    6px
                            )`,
                            backgroundSize: '100% 6px',
                            animation: 'fineScanMove 0.25s linear infinite',
                        }}></div>

                        {/* Scanline Sweep */}
                        <div style={{
                            position: 'absolute', left: 0, right: 0, top: 0,
                            height: '10%', zIndex: 5, pointerEvents: 'none',
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)',
                            animation: 'scanlineSweep 6s linear infinite',
                        }}></div>

                        {/* Barrel-lens vignette â€” darkens corners/edges like a real CRT */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                            background: `radial-gradient(ellipse 105% 105% at 50% 50%,
                                transparent 48%,
                                rgba(0,0,0,0.45) 72%,
                                rgba(0,0,0,0.88) 90%,
                                rgba(0,0,0,0.98) 100%
                            )`,
                        }}></div>

                        {/* Ambient blue flicker */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
                            background: 'rgba(0,100,200,0.05)',
                            animation: 'screenAmbient 4.5s ease-in-out infinite',
                        }}></div>

                        {/* Glass surface glare â€” top-left convex highlight */}
                        <div style={{
                            position: 'absolute', top: '-6%', left: '-5%',
                            width: '58%', height: '50%',
                            zIndex: 11, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 55%)',
                            borderRadius: '50%', transform: 'rotate(-12deg)',
                        }}></div>

                        {/* â”€â”€ Screen content â”€â”€ */}
                        <div style={{
                            position: 'relative', zIndex: 15,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'clamp(8px, 2.2vh, 28px)',
                            padding: '0 10%', width: '100%',
                            /* Slight bulge: centre content in the "flat" area of the convex tube */
                            transform: 'scale(0.92)',
                        }}>
                            {/* Flame / spark decoration */}
                            <div style={{
                                width: '100%', display: 'flex', justifyContent: 'center',
                                height: 'clamp(30px, 7vh, 72px)',
                                marginBottom: 'clamp(-8px, -1.5vh, -16px)',
                            }}>
                                <svg viewBox="0 0 340 80" preserveAspectRatio="xMidYMid meet"
                                    style={{ width: 'clamp(200px, 45vw, 440px)', height: '100%', overflow: 'visible' }}>
                                    <g style={{ animation: 'flameDance2 2.1s ease-in-out infinite, lightningSpark1 4s infinite', transformOrigin: '38px 72px' }}>
                                        <polygon points="38,72 22,35 32,42 25,8  46,38 36,32" fill="#ff8800" opacity="0.85" />
                                        <polygon points="38,72 26,28 35,35 29,5  49,32 39,26" fill="#ffcc00" opacity="0.65" />
                                    </g>
                                    <g style={{ animation: 'flameDance 1.8s ease-in-out infinite, lightningSpark2 5.5s infinite', transformOrigin: '80px 72px' }}>
                                        <polygon points="80,72 66,38 75,44 69,12  90,40 80,34" fill="#ff8800" opacity="0.90" />
                                        <polygon points="80,72 70,32 78,38 72,8   92,34 82,28" fill="#ffcc00" opacity="0.70" />
                                        <polygon points="80,72 74,40 80,44 76,22  86,42 82,38" fill="#ffffff" opacity="0.38" />
                                    </g>
                                    <g style={{ animation: 'flameDance 1.4s ease-in-out infinite, lightningSpark1 6.2s infinite', transformOrigin: '170px 68px' }}>
                                        <polygon points="170,72 154,28 165,38 158,0  182,0 175,38 186,28" fill="#ff5500" opacity="0.92" />
                                        <polygon points="170,72 158,32 168,40 162,6  178,6 172,40 181,32" fill="#ffdd00" opacity="0.75" />
                                        <polygon points="170,72 163,40 169,46 166,20 174,20 171,46 177,40" fill="#ffffff" opacity="0.55" />
                                    </g>
                                    <g style={{ animation: 'flameDance 2.0s ease-in-out infinite, lightningSpark2 5s infinite', transformOrigin: '260px 72px' }}>
                                        <polygon points="260,72 274,38 265,44 271,12  250,40 260,34" fill="#ff8800" opacity="0.90" />
                                        <polygon points="260,72 270,32 262,38 268,8   248,34 258,28" fill="#ffcc00" opacity="0.70" />
                                        <polygon points="260,72 266,40 260,44 264,22  254,42 258,38" fill="#ffffff" opacity="0.38" />
                                    </g>
                                    <g style={{ animation: 'flameDance2 1.7s ease-in-out infinite, lightningSpark1 4.7s infinite', transformOrigin: '302px 72px' }}>
                                        <polygon points="302,72 318,35 308,42 315,8  294,38 304,32" fill="#ff8800" opacity="0.85" />
                                        <polygon points="302,72 314,28 305,35 311,5  291,32 301,26" fill="#ffcc00" opacity="0.65" />
                                    </g>
                                    <ellipse cx="170" cy="74" rx="120" ry="9" fill="#ff6600" opacity="0.15" />
                                    <ellipse cx="170" cy="74" rx="70" ry="5" fill="#ffaa00" opacity="0.12" />
                                </svg>
                            </div>

                            {/* Title area — wrapped div for hover glow */}
                            <div
                                className="crt-title-area"
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 'clamp(4px, 1vh, 12px)',
                                    animation: 'titleGlowPulse 4s ease-in-out infinite',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* SNEHOJIT PAUL */}
                                <div
                                    onMouseEnter={playHoverSnehojit}
                                    style={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: 'clamp(0.75rem, 2.8vw, 1.8rem)',
                                        color: '#00e8ff',
                                        letterSpacing: '0.16em',
                                        textAlign: 'center',
                                        animation: 'subGlowPulse 3.5s ease-in-out infinite',
                                        lineHeight: 1.2,
                                        userSelect: 'none',
                                    }}>
                                    SNEHOJIT PAUL
                                </div>

                                {/* PORTFOLIO */}
                                <div
                                    onMouseEnter={playHoverPortfolio}
                                    className="crt-title-gradient"
                                    style={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: 'clamp(2.4rem, 9.5vw, 6.5rem)',
                                        fontWeight: 900,
                                        letterSpacing: '0.04em',
                                        textAlign: 'center',
                                        lineHeight: 1,
                                        userSelect: 'none',
                                    }}
                                >
                                    PORTFOLIO
                                </div>
                            </div>

                            {/* Separator */}
                            <div style={{
                                width: 'clamp(200px, 55%, 600px)', height: '2px',
                                background: 'linear-gradient(90deg, transparent 0%, #00ccff 25%, #ff6600 75%, transparent 100%)',
                                boxShadow: '0 0 10px #00aaffcc, 0 0 18px #ff440066',
                                opacity: 0.85,
                            }}></div>

                            {/* ── Audio unlock gate → 3-phase text ── */}
                            {soundPhase === 'enable' && (
                                <div
                                    onClick={handleEnableSound}
                                    style={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: 'clamp(0.55rem, 1.4vw, 0.9rem)',
                                        color: '#00ffff',
                                        letterSpacing: '0.22em',
                                        textAlign: 'center',
                                        animation: 'neonFlicker 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite',
                                        userSelect: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ENABLE SOUND
                                </div>
                            )}

                            {soundPhase === 'booting' && (
                                <div
                                    ref={bootContainerRef}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        width: 'clamp(180px, 40vw, 340px)',
                                        userSelect: 'none',
                                        transformOrigin: 'center',
                                    }}
                                >
                                    {/* SYSTEM BOOTING... label */}
                                    <div style={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: 'clamp(0.45rem, 1.1vw, 0.75rem)',
                                        color: '#00ffcc',
                                        letterSpacing: '0.2em',
                                        textAlign: 'center',
                                        textShadow: '0 0 10px #00ffcc, 0 0 25px rgba(0,255,200,0.5)',
                                    }}>
                                        SYSTEM BOOTING...
                                    </div>

                                    {/* Loading bar track */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(0,255,200,0.08)',
                                        border: '1px solid rgba(0,255,200,0.3)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        boxShadow: '0 0 8px rgba(0,255,200,0.15)',
                                    }}>
                                        {/* Filled bar — width driven by GSAP via ref */}
                                        <div
                                            ref={loadingBarRef}
                                            style={{
                                                height: '100%',
                                                width: '0%',
                                                background: 'linear-gradient(90deg, #00cc88, #00ffcc, #00eeff)',
                                                borderRadius: '4px',
                                                boxShadow: '0 0 12px #00ffcc, 0 0 24px rgba(0,255,200,0.4)',
                                                transition: 'none',
                                            }}
                                        />
                                        {/* Scanline sweep on bar */}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)',
                                            animation: 'scanSweepH 0.9s linear infinite',
                                            pointerEvents: 'none',
                                        }} />
                                    </div>

                                    {/* Percentage counter */}
                                    <div
                                        ref={loadingPctRef}
                                        style={{
                                            fontFamily: "'Press Start 2P', monospace",
                                            fontSize: 'clamp(0.4rem, 0.9vw, 0.6rem)',
                                            color: '#00ffcc',
                                            letterSpacing: '0.15em',
                                            textAlign: 'center',
                                            textShadow: '0 0 6px #00ffcc',
                                            opacity: 0.8,
                                        }}
                                    >
                                        0%
                                    </div>
                                </div>
                            )}

                            {soundPhase === 'ready' && (
                                <div
                                    id="standby-powerOn"
                                    onClick={!isVideoPlaying && !hasInteracted ? handleInitialInteraction : undefined}
                                    onMouseEnter={playHoverPowerOn}
                                    style={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: 'clamp(0.55rem, 1.6vw, 1rem)',
                                        color: '#ffffff',
                                        letterSpacing: '0.22em',
                                        textAlign: 'center',
                                        textShadow: '0 0 8px rgba(255,255,255,0.9)',
                                        animation: 'arcadeBlink 2s ease-in-out infinite',
                                        userSelect: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    CLICK TO POWER ON
                                </div>
                            )}
                        </div>
                    </div>

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                        LAYER B: CRT frame image (on top, transparent centre)
                        Scale to 107% so the physical bezel bleeds slightly off-edge
                    â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%) scale(1.07)',
                        width: '100%', height: '100%',
                        pointerEvents: 'none',
                        zIndex: 50,
                    }}>
                        <img
                            src="/crt/crt-overlay.png"
                            alt=""
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                /* multiply makes the dark bezel opaque while keeping transparent center clear */
                                mixBlendMode: 'multiply',
                            }}
                        />
                    </div>

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                        LAYER C: Screen flash on click (brief white brightness burst)
                        Triggered via CSS animation when .crt-flash-active class is present
                    â•â•â••â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    <div
                        id="crt-flash-layer"
                        style={{
                            position: 'absolute', inset: 0, zIndex: 100,
                            background: 'rgba(200,240,255,0.95)',
                            pointerEvents: 'none',
                            opacity: 0,
                        }}
                    ></div>
                </div>
            )}




            {/* Drifting Background Container - Only shown after video */}
            {!isVideoPlaying && hasInteracted && (
                <>
                    <div className="absolute inset-0 z-0 drift-bg w-[110%] h-[110%] -left-[5%] -top-[5%] pointer-events-none">

                        {/* Arcade Background Silhouettes */}
                        <div className="arcade-silhouettes absolute inset-0 pointer-events-none z-0 flex items-end justify-center gap-[15vw] opacity-40 px-10 overflow-hidden" style={{ perspective: '1000px' }}>
                            {/* Left Machine Silhouette */}
                            <div className="w-[30vw] h-[70vh] bg-[#050508] border-r-4 border-t-4 border-[#111] rounded-tr-3xl relative" style={{ transform: 'translateZ(-400px) rotateY(15deg)' }}>
                                <div className="absolute top-[25%] left-[10%] w-[80%] h-[30%] bg-[#08080c] flex items-center justify-center shadow-[0_0_50px_rgba(0,255,100,0.1)]">
                                    <div className="w-[85%] h-[85%] bg-[#020502] rounded-3xl" style={{ animation: 'pulse 5s infinite' }}></div>
                                </div>
                            </div>
                            {/* Right Machine Silhouette */}
                            <div className="w-[30vw] h-[70vh] bg-[#050508] border-l-4 border-t-4 border-[#111] rounded-tl-3xl relative" style={{ transform: 'translateZ(-400px) rotateY(-15deg)' }}>
                                <div className="absolute top-[25%] left-[10%] w-[80%] h-[30%] bg-[#08080c] flex items-center justify-center shadow-[0_0_50px_rgba(255,0,100,0.1)]">
                                    <div className="w-[85%] h-[85%] bg-[#050202] rounded-3xl" style={{ animation: 'pulse 4s infinite' }}></div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Glowing Floor Grid */}
                    <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-neon-pink/10 to-transparent flex items-end justify-center pointer-events-none z-0 opacity-40">
                        <div className="w-full h-full border-t border-neon-pink/20 shadow-[0_0_30px_rgba(255,0,255,0.1)]"
                            style={{
                                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .15) 25%, rgba(255, 0, 255, .15) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .15) 75%, rgba(255, 0, 255, .15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 0, 255, .15) 25%, rgba(255, 0, 255, .15) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .15) 75%, rgba(255, 0, 255, .15) 76%, transparent 77%, transparent)',
                                backgroundSize: '80px 80px',
                                transform: 'perspective(600px) rotateX(75deg)',
                                transformOrigin: 'bottom'
                            }}
                        ></div>
                    </div>

                    {/* Ambient Background Glow & Fog */}
                    <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(40,10,50,0.5)_0%,rgba(0,0,0,1)_80%)] mix-blend-overlay"></div>
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" style={{ animation: 'pulse 4s infinite' }}></div>

                    {/* Neon Wall Reflections */}
                    <div className="absolute top-[20%] left-[25%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-neon-pink rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse" style={{ animationDuration: "6s" }}></div>
                    <div className="absolute top-[10%] right-[20%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-neon-blue rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse" style={{ animationDuration: "8s" }}></div>

                    {/* Soft fog rolling effect */}
                    <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black via-[#080310] to-transparent opacity-80 z-[5] pointer-events-none"></div>

                    {/* Floating Dust Particles */}
                    <div className="absolute inset-0 pointer-events-none z-[15] overflow-hidden">
                        <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-white rounded-full opacity-30 shadow-[0_0_5px_white] animate-pulse translate-y-[-10px]" style={{ animationDuration: "5s" }}></div>
                        <div className="absolute top-[40%] left-[70%] w-2 h-2 bg-neon-pink text-transparent rounded-full opacity-20 shadow-[0_0_8px_#ff00ff] animate-pulse translate-x-[-20px] translate-y-[-50px]" style={{ animationDuration: "4s" }}></div>
                        <div className="absolute top-[60%] left-[20%] w-2 h-2 bg-neon-blue text-transparent rounded-full opacity-10 shadow-[0_0_10px_#00ffff] animate-pulse translate-y-[30px]" style={{ animationDuration: "7s" }}></div>
                        <div className="absolute top-[30%] left-[80%] w-1.5 h-1.5 bg-white rounded-full opacity-40 shadow-[0_0_5px_white] animate-pulse translate-x-[40px]" style={{ animationDuration: "6s" }}></div>
                        <div className="absolute top-[80%] left-[50%] w-1.5 h-1.5 bg-white rounded-full opacity-20 shadow-[0_0_8px_white] animate-pulse translate-y-[-80px]" style={{ animationDuration: "8s" }}></div>
                    </div>

                    {/* Ambient Screen Light Flicker reflecting on the room */}
                    <div className="absolute inset-0 pointer-events-none z-[8] bg-[radial-gradient(circle_at_50%_40%,rgba(0,180,255,0.08)_0%,rgba(0,0,0,0)_60%)] animate-pulse" style={{ animationDuration: "0.15s" }}></div>
                </>
            )}

            {/* Custom Coin Cursor */}
            {showCoin && (
                <div
                    ref={coinRef}
                    className="fixed top-0 left-0 w-12 h-12 z-[100] pointer-events-none"
                    style={{
                        transform: `translate(${mousePos.x - 24}px, ${mousePos.y - 24}px)`
                    }}
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 border-2 border-yellow-200 shadow-[0_0_15px_rgba(255,255,0,0.6),inset_0_0_10px_rgba(0,0,0,0.6)] flex items-center justify-center animate-[pulse_2s_infinite]">
                        <div className="w-[75%] h-[75%] rounded-full border border-yellow-400/50 flex flex-col items-center justify-center">
                            <span className="font-pixel text-yellow-900 text-[8px] leading-tight">1</span>
                            <span className="font-pixel text-yellow-900 text-[4px] uppercase tracking-wider">Coin</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Pixel Tunnel Burst Particles (Visible only during portal transition) */}
            {showPortal && (
                <div className="absolute inset-0 pointer-events-none z-[120] overflow-hidden flex items-center justify-center transform-gpu" style={{ perspective: '500px' }}>
                    {portalFragments.map((frag) => (
                        <div
                            key={frag.id}
                            className="absolute rounded-sm mix-blend-screen shadow-[0_0_10px_currentColor]"
                            style={{
                                backgroundColor: frag.color,
                                width: frag.size,
                                height: frag.size,
                                left: `calc(50% + ${frag.x}vw)`,
                                top: `calc(50% + ${frag.y}vh)`,
                                color: frag.color,
                                animation: `flyForward ${frag.animationDuration} ease-in forwards`,
                                animationDelay: frag.animationDelay
                            }}
                        />
                    ))}

                    <style jsx>{`
                .custom-cabinet-outline {
                    filter: drop-shadow(0 0 10px rgba(0,255,100,0.8)) drop-shadow(0 0 20px rgba(255,0,255,0.8));
                    opacity: 0.3;
                }

                        @keyframes flyForward {
                            0% { transform: translateZ(-1000px) scale(0.1); opacity: 0; }
                            50% { opacity: 1; }
                            100% { transform: translateZ(500px) scale(3); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* The 3D Arcade Cabinet */}
            <div ref={idleWrapperRef} className="relative z-10 w-full h-full flex items-center justify-center">
                <div
                    ref={cabinetRef}
                    className={`relative w-[85vw] max-w-[550px] h-[85vh] max-h-[850px] flex flex-col items-center will-change-transform ${!cabinetVisible ? (showCabinetOutline ? "custom-cabinet-outline opacity-30" : "opacity-0 invisible") : ""}`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `perspective(1200px) rotateX(${!isStarting ? tiltX : 0}deg) rotateY(${!isStarting ? tiltY : 0}deg)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    {/* Glowing Side Art Panels */}
                    <div
                        className="absolute -left-8 top-[5%] w-12 h-[90%] bg-[#130825] border-4 border-neon-pink rounded-tl-xl rounded-bl-3xl shadow-[-15px_0_40px_rgba(255,0,255,0.4),inset_5px_0_15px_rgba(0,0,0,0.8)] flex flex-col items-center py-10 gap-8 overflow-hidden z-[-1]"
                        style={{ transform: 'translateZ(-40px) rotateY(-25deg)', transformOrigin: 'right' }}
                    >
                        <div className={`w-full h-1/3 bg-gradient-to-b skew-y-12 transform -translate-y-8 transition-colors duration-1000 ${lightsOn.sides ? "from-neon-pink/90 to-transparent" : "from-black to-transparent"}`}></div>
                        <div className={`w-full h-1/4 bg-gradient-to-t skew-y-12 mt-auto transform translate-y-8 transition-colors duration-1000 ${lightsOn.sides ? "from-neon-cyan/90 to-transparent" : "from-black to-transparent"}`}></div>
                    </div>

                    <div
                        className="absolute -right-8 top-[5%] w-12 h-[90%] bg-[#0f0518] border-4 border-neon-cyan rounded-tr-xl rounded-br-3xl shadow-[15px_0_40px_rgba(0,255,255,0.4),inset_-5px_0_15px_rgba(0,0,0,0.8)] flex flex-col items-center py-10 gap-8 overflow-hidden z-[-1]"
                        style={{ transform: 'translateZ(-40px) rotateY(25deg)', transformOrigin: 'left' }}
                    >
                        <div className={`w-full h-1/3 bg-gradient-to-b -skew-y-12 transform -translate-y-8 transition-colors duration-1000 ${lightsOn.sides ? "from-neon-cyan/90 to-transparent" : "from-black to-transparent"}`}></div>
                        <div className={`w-full h-1/4 bg-gradient-to-t -skew-y-12 mt-auto transform translate-y-8 transition-colors duration-1000 ${lightsOn.sides ? "from-neon-pink/90 to-transparent" : "from-black to-transparent"}`}></div>
                    </div>

                    {/* 1. Marquee Header (Top Section protruding) */}
                    <div
                        className="w-full h-[15%] min-h-[100px] bg-[#130825] border-[12px] border-[#1a0b3a] border-b-[6px] rounded-t-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8),0_0_50px_rgba(255,0,255,0.6)] flex flex-col items-center justify-center relative will-change-transform"
                        style={{ transform: 'translateZ(20px)' }}
                    >
                        {/* Top Neon Trims */}
                        <div className="absolute top-0 w-full h-1 bg-neon-pink shadow-[0_0_10px_#ff00ff] rounded-t-xl opacity-80"></div>

                        <div className="w-[96%] h-[85%] bg-black flex items-center justify-center border-4 border-neon-cyan shadow-[inset_0_0_40px_rgba(0,255,255,0.7),0_0_15px_rgba(0,255,255,0.5)]">
                            <h1 className={`text-3xl md:text-5xl font-pixel text-white tracking-widest text-center transition-all duration-1000 ${lightsOn.marquee ? "drop-shadow-[0_0_15px_#ff00ff,0_0_30px_#00ffff,0_0_5px_#ffffff] animate-pulse" : "opacity-20 drop-shadow-none"}`}>SNEHOJIT</h1>
                        </div>
                        {/* Inner bezel depth */}
                        <div className="absolute inset-0 shadow-[inset_0_10px_15px_rgba(255,255,255,0.1),inset_0_-10px_20px_rgba(0,0,0,0.9)] pointer-events-none rounded-t-lg"></div>
                    </div>

                    {/* 2. Tube Screen Area (Recessed) */}
                    <div
                        className="w-[92%] h-[45%] bg-[#0d071a] border-[16px] border-[#160a2a] border-t-[8px] border-b-[20px] relative flex items-center justify-center shadow-[inset_0_30px_60px_rgba(0,0,0,0.98),0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden will-change-transform"
                        style={{ transform: 'translateZ(-10px)' }}
                    >
                        {/* Side Neon Edge Strips */}
                        <div className="absolute left-0 top-0 w-1 h-full bg-neon-pink shadow-[0_0_15px_#ff00ff,inset_0_0_2px_white] opacity-90 pb-8 z-40"></div>
                        <div className="absolute right-0 top-0 w-1 h-full bg-neon-cyan shadow-[0_0_15px_#00ffff,inset_0_0_2px_white] opacity-90 pb-8 z-40"></div>

                        {/* The CRT Glass Component */}
                        <div
                            ref={screenRef}
                            className={`w-[95%] h-[92%] relative flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-[#080514] shadow-[inset_0_0_50px_rgba(255,255,255,0.02)] ${isGlitching ? 'animate-[pulse_0.05s_infinite]' : ''}`}
                            style={{
                                backgroundColor: '#040406',
                                clipPath: isGlitching ? 'polygon(0 0, 100% 5%, 100% 100%, 5% 100%, 0 45%)' : 'none',
                                transform: isGlitching ? 'translate(5px, -5px) skewX(2deg)' : 'none'
                            }}
                        >
                            {/* CRT Scanline Overlay & RGB shift pixelation */}
                            <div className="absolute inset-0 pointer-events-none z-50 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_4px)] opacity-50 mix-blend-overlay"></div>
                            <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.1),rgba(0,255,0,0.05),rgba(0,0,255,0.1))] bg-[length:100%_4px,3px_100%] mix-blend-overlay" style={{ animation: "pulse 0.15s infinite alternate", opacity: 0.85 }}></div>

                            {/* Screen Content */}
                            {!isStarting ? (
                                <div className={`relative flex items-center justify-center z-[500] w-full px-4 h-full transition-opacity duration-500 ease-in-out ${showAttract ? 'opacity-100' : 'opacity-0'}`}>
                                    <h2
                                        key={attractIndex}
                                        className="text-xl md:text-3xl font-pixel text-[#ffea00] drop-shadow-[0_0_15px_rgba(255,234,0,1)] text-center w-full leading-relaxed px-8 animate-[crtTextFlicker_0.2s_infinite] animate-pulse"
                                    >
                                        {attractPhrases[attractIndex]}
                                    </h2>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start justify-center z-[200] w-full h-full px-8 py-8 md:px-12 relative overflow-hidden">
                                    {showPortal && (
                                        <div className="absolute inset-0 flex items-center justify-center z-0 animate-[spin_10s_linear_infinite]">
                                            <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,255,0.8)_90deg,transparent_180deg,rgba(255,0,255,0.8)_270deg,transparent_360deg)] opacity-80 mix-blend-screen scale-150 rounded-full blur-xl"></div>
                                        </div>
                                    )}

                                    {bootText && (
                                        <div className={`font-pixel text-green-400 text-xs md:text-sm text-left leading-loose drop-shadow-[0_0_5px_rgba(0,255,0,0.8)] z-10 relative ${isGlitching ? 'text-red-500 scale-110 skew-x-12 ml-4' : ''}`}>
                                            <p className="mb-2 uppercase w-fit overflow-hidden border-r-2 border-green-400 animate-[pulse_0.5s_infinite]">{bootText}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Curved Glass Bevel & Glare */}
                            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,255,255,0.1)] pointer-events-none rounded-[2.5rem] z-30"></div>
                            <div className="absolute inset-0 shadow-[inset_0_20px_50px_rgba(255,255,255,0.03)] pointer-events-none rounded-[2.5rem] z-40"></div>
                            <div className="absolute -top-10 -right-10 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_50%)] pointer-events-none z-50 rounded-[2.5rem] transform -rotate-12"></div>
                        </div>
                    </div>

                    {/* 3. Control Panel (Protruding and Slanted) */}
                    <div
                        className="w-full h-[12%] bg-[#1a0b3a] border-[12px] border-[#160a2a] border-t-0 relative shadow-[0_30px_40px_rgba(0,0,0,0.95),inset_0_5px_20px_rgba(255,0,255,0.3)] flex items-center justify-between px-10 will-change-transform"
                        style={{ transform: 'translateZ(40px)' }}
                    >
                        {/* Control Panel Neon Edge Strips */}
                        <div className="absolute left-[-12px] top-0 w-3 h-full bg-neon-pink shadow-[0_0_15px_#ff00ff,-5px_0_10px_#ff00ff,inset_0_0_2px_white] opacity-90 z-20" style={{ transform: 'rotateY(-90deg)', transformOrigin: 'left' }}></div>
                        <div className="absolute right-[-12px] top-0 w-3 h-full bg-neon-cyan shadow-[0_0_15px_#00ffff,5px_0_10px_#00ffff,inset_0_0_2px_white] opacity-90 z-20" style={{ transform: 'rotateY(90deg)', transformOrigin: 'right' }}></div>

                        {/* Joystick Dummy */}
                        <div onMouseEnter={playJoystickSound} className="arcade-joystick relative w-12 h-12 flex items-center justify-center group pointer-events-auto cursor-none hover:scale-105 transition-all duration-150">
                            <div className="absolute w-12 h-12 rounded-full bg-black shadow-[inset_0_5px_5px_rgba(255,255,255,0.2),0_0_10px_rgba(255,0,0,0.3)] group-hover:shadow-[inset_0_5px_5px_rgba(255,255,255,0.2),0_0_20px_rgba(255,0,0,0.6)]"></div>
                            <div className="absolute w-4 h-10 bg-gray-300 -top-6 rounded-t-full shadow-[inset_-2px_0_5px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:rotate-12 group-hover:translate-x-1 origin-bottom"></div>
                            <div className="absolute w-8 h-8 rounded-full bg-neon-pink -top-10 active:rotate-x-12 active:translate-y-2 active:scale-95 shadow-[inner_0_0_10px_rgba(255,255,255,0.8),inset_-2px_-5px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(255,0,255,0.8)] group-hover:shadow-[inner_0_0_10px_rgba(255,255,255,0.8),inset_-2px_-5px_10px_rgba(0,0,0,0.5),0_0_30px_rgba(255,0,255,1)] transition-transform duration-200 group-hover:rotate-12 group-hover:translate-x-2 group-hover:-translate-y-1 origin-bottom"></div>
                        </div>

                        {/* Buttons Dummy */}
                        <div className="flex gap-3 pointer-events-auto cursor-none">
                            <div onClick={playButtonSound} className="arcade-button w-8 h-8 rounded-full bg-red-400 border-2 border-red-900 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4),0_0_15px_rgba(255,0,0,0.8)] mt-4 hover:bg-red-300 active:bg-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,1)] hover:-translate-y-1 hover:scale-105 active:scale-90 active:translate-y-1 transition-all duration-150"></div>
                            <div onClick={playButtonSound} className="arcade-button w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-900 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4),0_0_15px_rgba(0,100,255,0.8)] mt-1 hover:bg-blue-300 active:bg-blue-500 hover:shadow-[0_0_20px_rgba(0,100,255,1)] hover:-translate-y-1 hover:scale-105 active:scale-90 active:translate-y-1 transition-all duration-150"></div>
                            <div onClick={playButtonSound} className="arcade-button w-8 h-8 rounded-full bg-green-400 border-2 border-green-900 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4),0_0_15px_rgba(0,255,0,0.8)] mt-3 hover:bg-green-300 active:bg-green-500 hover:shadow-[0_0_20px_rgba(0,255,0,1)] hover:-translate-y-1 hover:scale-105 active:scale-90 active:translate-y-1 transition-all duration-150"></div>
                            <div onClick={playButtonSound} className="arcade-button w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-800 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4),0_0_20px_rgba(255,255,0,0.8)] hover:bg-yellow-300 active:bg-yellow-500 hover:shadow-[0_0_25px_rgba(255,255,0,1)] hover:-translate-y-1 hover:scale-105 active:scale-90 active:translate-y-1 transition-all duration-150"></div>
                        </div>
                    </div>

                    {/* 4. Lower Base / Coin Door Area */}
                    <div
                        className="w-[94%] h-[28%] bg-[#0d071a] border-[16px] border-[#160a2a] border-t-0 flex flex-col items-center justify-center relative shadow-[inset_0_20px_50px_rgba(0,0,0,0.98)] will-change-transform"
                        style={{ transform: 'translateZ(10px)' }}
                    >
                        {/* Base Neon Edge Strips */}
                        <div className="absolute left-[-16px] top-0 w-4 h-full bg-neon-pink shadow-[0_0_15px_#ff00ff,-5px_0_10px_#ff00ff,inset_0_0_2px_white] opacity-90 z-20" style={{ transform: 'rotateY(-90deg)', transformOrigin: 'left' }}></div>
                        <div className="absolute right-[-16px] top-0 w-4 h-full bg-neon-cyan shadow-[0_0_15px_#00ffff,5px_0_10px_#00ffff,inset_0_0_2px_white] opacity-90 z-20" style={{ transform: 'rotateY(90deg)', transformOrigin: 'right' }}></div>
                        {/* Twin Coin Slots Plate */}
                        <div className="w-[180px] h-[140px] bg-[#151515] border-[6px] border-[#222] rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.05)] flex justify-center gap-6 p-4 pt-6 relative group/slots">

                            {/* Invisible hover area to smoothly pull the coin in */}
                            <div
                                className="absolute inset-0 z-[120] cursor-none"
                                onClick={handleStart}
                                onMouseMove={(e) => {
                                    if (isStarting) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    // Calculate position relative to the slot center
                                    const targetX = rect.left + rect.width / 2;
                                    const targetY = rect.top + rect.height / 2;

                                    // Interpolate the coin towards the slot based on cursor proximity
                                    const dx = e.clientX - targetX;
                                    const dy = e.clientY - targetY;

                                    // Stronger pull when closer to center
                                    const pullStrength = 0.85;

                                    setMousePos({
                                        x: targetX + dx * (1 - pullStrength),
                                        y: targetY + dy * (1 - pullStrength) - 15 // Offset slightly above
                                    });
                                }}
                                onMouseLeave={(e) => {
                                    if (!isStarting) {
                                        setMousePos({ x: e.clientX, y: e.clientY });
                                    }
                                }}
                            ></div>

                            {/* Coin Mechanism Left */}
                            <div className="flex flex-col items-center pointer-events-none">
                                {/* Insert Coin Slot - Interactivity target */}
                                <div
                                    className="w-[12px] h-[45px] bg-black border-[3px] border-neon-yellow shadow-[0_0_15px_rgba(255,255,0,0.8),inset_0_5px_10px_rgba(0,0,0,1)] rounded-full relative mb-4 transition-all z-[110] group-hover/slots:shadow-[0_0_25px_rgba(255,255,0,1),inset_0_5px_10px_rgba(0,0,0,1)]"
                                ></div>
                                <div className="insert-coin-text text-[8px] sm:text-[9px] text-center leading-tight font-pixel text-red-500 bg-[#050505] px-[4px] py-[2px] border border-red-900 shadow-[0_0_8px_rgba(255,0,0,0.5)] mt-1 opacity-0">INSERT<br />COIN</div>
                            </div>

                            {/* Coin Mechanism Right */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-[12px] h-[45px] bg-black border-[3px] border-neon-yellow shadow-[0_0_15px_rgba(255,255,0,0.8),inset_0_5px_10px_rgba(0,0,0,1)] rounded-full relative mb-4 cursor-pointer hover:shadow-[0_0_25px_rgba(255,255,0,1),inset_0_5px_10px_rgba(0,0,0,1)] transition-all z-[110]"
                                    onClick={handleStart}
                                ></div>
                                <div className="text-[9px] font-pixel text-red-500 bg-[#050505] px-[6px] py-[2px] border border-red-900 shadow-[0_0_8px_rgba(255,0,0,0.5)] mt-1">25Â¢</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
