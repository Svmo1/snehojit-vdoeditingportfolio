"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { playArcadeSound } from "../utils/audio";

// ─── Floating arcade feedback text (singleton) ───────────────────────────────
let _syfbMounted = false;

function SystemFeedback() {
  const [isMine] = useState(() => {
    if (_syfbMounted) return false;
    _syfbMounted = true;
    return true;
  });

  const elRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!isMine) return;
    const show = (msg) => {
      const el = elRef.current;
      if (!el) return;
      if (tlRef.current) tlRef.current.kill();
      el.textContent = msg;
      tlRef.current = gsap.timeline()
        .set(el, { opacity: 0, y: -8, display: "block" })
        .to(el, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" })
        .to(el, { opacity: 1, duration: 0.6 })
        .to(el, {
          opacity: 0, y: 8, duration: 0.4, ease: "power2.in",
          onComplete: () => { if (el) el.style.display = "none"; }
        });
    };

    const onOpen = () => {
      show("ACCESS GRANTED");
      setTimeout(() => show("LOADING MODULE..."), 900);
    };
    const onClose = () => show("EXITING...");

    window.addEventListener("module:opened", onOpen);
    window.addEventListener("module:closed", onClose);
    return () => {
      window.removeEventListener("module:opened", onOpen);
      window.removeEventListener("module:closed", onClose);
      _syfbMounted = false;
    };
  }, [isMine]);

  if (!isMine) return null;

  return (
    <div
      ref={elRef}
      style={{
        display: "none",
        position: "fixed",
        top: "6vh",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        fontFamily: "'Press Start 2P', monospace, sans-serif",
        fontSize: "10px",
        letterSpacing: "0.2em",
        color: "#00ffaa",
        textShadow: "0 0 8px #00ffaa, 0 0 18px rgba(0,255,170,0.5)",
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    />
  );
}

export default function ModuleCard({ title, children, color = "neon-blue", className = "", animateType = "fade", expandable = true }) {
  const cardRef = useRef(null);
  const borderRef = useRef(null);
  const innerGlowRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [rect, setRect] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Ambient audio singleton — try autoplay, fall back to first click
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.__ambientAudio) {
      const audio = new Audio("/audio/arcade-ambience.mp3");
      audio.loop = true;
      audio.volume = 0.18;
      window.__ambientAudio = audio;

      audio.play().catch(() => {
        // Browser blocked autoplay — unlock on first interaction
        const unlock = () => {
          audio.play().catch(() => { });
          window.removeEventListener("click", unlock);
          window.removeEventListener("touchstart", unlock);
        };
        window.addEventListener("click", unlock);
        window.addEventListener("touchstart", unlock);
      });
    }
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      if (isExpanded) return;
      playArcadeSound("hover");
    };

    // Hover Animation Setup
    const handleMouseMove = (e) => {
      if (isExpanded) return;
      const elementRect = card.getBoundingClientRect();
      const x = e.clientX - elementRect.left - elementRect.width / 2;
      const y = e.clientY - elementRect.top - elementRect.height / 2;

      const rotateX = (y / elementRect.height) * -15;
      const rotateY = (x / elementRect.width) * 15;

      gsap.to(card, {
        rotateX,
        rotateY,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.to(borderRef.current, {
        boxShadow: `0 0 60px rgba(var(--color-${color}), 0.8), inset 0 0 30px rgba(var(--color-${color}), 0.3)`,
        duration: 0.4
      });

      gsap.to(innerGlowRef.current, {
        opacity: 0.8,
        duration: 0.4
      });
    };

    const handleMouseLeave = () => {
      if (isExpanded) return;
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      });

      // Return glow to base
      gsap.to(borderRef.current, {
        boxShadow: `0 0 15px rgba(var(--color-${color}), 0.2), inset 0 0 5px rgba(var(--color-${color}), 0.1)`,
        duration: 0.8
      });

      // Hide inner gradient
      gsap.to(innerGlowRef.current, {
        opacity: 0,
        duration: 0.8
      });
    };

    const handleMouseDown = () => {
      if (isExpanded) return;
      gsap.to(card, { scale: 0.96, duration: 0.08, ease: "power2.in" });
    };

    const handleMouseUp = () => {
      if (isExpanded) return;
      gsap.to(card, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mousedown", handleMouseDown);
    card.addEventListener("mouseup", handleMouseUp);

    // Set base glow
    gsap.set(borderRef.current, {
      boxShadow: `0 0 15px rgba(var(--color-${color}), 0.2), inset 0 0 5px rgba(var(--color-${color}), 0.1)`
    });

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mousedown", handleMouseDown);
      card.removeEventListener("mouseup", handleMouseUp);
    };
  }, [color, isExpanded]);

  // ─── Dim‑other‑modules: listen for sibling open/close events ─────────────
  useEffect(() => {
    const card = cardRef.current;
    const border = borderRef.current;
    if (!card) return;

    const onModuleOpened = (e) => {
      if (e.detail?.id === card) return; // this is the active card
      // Dim this card
      gsap.to(card, { opacity: 0.6, scale: 0.98, duration: 0.35, ease: "power2.out" });
    };

    const onModuleClosed = () => {
      // Restore this card
      gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
      // Clear active glow if any
      if (border) gsap.to(border, {
        boxShadow: `0 0 15px rgba(var(--color-${color}), 0.2), inset 0 0 5px rgba(var(--color-${color}), 0.1)`,
        duration: 0.4
      });
    };

    window.addEventListener("module:opened", onModuleOpened);
    window.addEventListener("module:closed", onModuleClosed);
    return () => {
      window.removeEventListener("module:opened", onModuleOpened);
      window.removeEventListener("module:closed", onModuleClosed);
    };
  }, [color]);

  // Color mappings for classes
  const borderColors = {
    "neon-blue": "border-neon-blue",
    "neon-pink": "border-neon-pink",
    "neon-green": "border-neon-green",
    "neon-yellow": "border-neon-yellow"
  };

  const textColors = {
    "neon-blue": "text-neon-blue",
    "neon-pink": "text-neon-pink",
    "neon-green": "text-neon-green",
    "neon-yellow": "text-neon-yellow"
  };

  const bgColors = {
    "neon-blue": "bg-neon-blue/10",
    "neon-pink": "bg-neon-pink/10",
    "neon-green": "bg-neon-green/10",
    "neon-yellow": "bg-neon-yellow/10"
  };

  const borderClass = borderColors[color] || borderColors["neon-blue"];
  const textClass = textColors[color] || textColors["neon-blue"];
  const bgClass = bgColors[color] || bgColors["neon-blue"];

  const handleCardClick = () => {
    if (title.toLowerCase().includes("about me") || (!expandable && !title.toLowerCase().includes("contact"))) {
      playArcadeSound("error");
      gsap.fromTo(cardRef.current,
        { x: -6 },
        { x: 6, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }
      );
      return;
    }

    if (title.toLowerCase().includes("contact") || title.toLowerCase().includes("call terminal")) {
      playArcadeSound("click");
      setShowTerminal(true);
      return;
    }

    if (isExpanded) return;

    const card = cardRef.current;
    if (!card) return;

    playArcadeSound("click");
    playArcadeSound("expand");

    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.3, ease: "power2.out" });

    // Apply persistent neon glow on the active card
    if (borderRef.current) {
      gsap.to(borderRef.current, {
        boxShadow: `0 0 90px rgba(var(--color-${color}), 1), inset 0 0 40px rgba(var(--color-${color}), 0.45)`,
        duration: 0.4
      });
    }

    // Broadcast so siblings dim themselves
    window.dispatchEvent(new CustomEvent("module:opened", { detail: { id: card } }));

    const elementRect = card.getBoundingClientRect();
    setRect(elementRect);
    setIsExpanded(true);
  };

  // Wrap onClose to fire the closed event
  const handleClose = useCallback(() => {
    window.dispatchEvent(new CustomEvent("module:closed"));
    setIsExpanded(false);
  }, []);

  return (
    <>
      <div
        className={`module-container perspective-1000 ${className} ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        data-animate={animateType}
        style={{ transition: "opacity 0.2s" }}
      >
        <div
          ref={cardRef}
          onClick={handleCardClick}
          className={`relative w-[450px] min-h-[500px] border border-white/10 bg-[#06060c]/80 backdrop-blur-md flex flex-col items-center justify-start p-[20px] transform-origin-center transition-colors overflow-hidden cursor-pointer ${borderClass}`}
          style={{
            transformStyle: "preserve-3d",
            boxShadow: '0 0 40px rgba(0,255,255,0.15), 0 0 80px rgba(255,0,255,0.10)'
          }}
        >
          {/* Glow & Scanline Inner Wrapper */}
          <div ref={borderRef} className={`absolute inset-0 border border-transparent pointer-events-none z-0`}></div>

          {/* Inner Gradient Pulse (Hover Response) */}
          <div ref={innerGlowRef} className="absolute inset-0 z-0 pointer-events-none opacity-0 mix-blend-screen"
            style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }}>
          </div>

          {/* Scanlines Overlay - very subtle repeating linear gradient */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}>
          </div>

          {/* Top Header Label */}
          <div className={`w-full text-center mb-[12px] bg-[#0a0a16] border-b ${borderClass} z-10 break-words py-1`}>
            <h2 className={`font-pixel text-lg tracking-widest ${textClass} drop-shadow-[0_0_8px_currentColor]`}>
              {title}
            </h2>
          </div>

          {/* Content Children */}
          <div className="relative z-10 w-full h-full flex flex-col items-center flex-1">
            {children}
          </div>

          {/* Decorative System Nodes */}
          <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full ${bgClass} ${borderClass} border`}></div>
          <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${bgClass} ${borderClass} border`}></div>
          <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${bgClass} ${borderClass} border`}></div>
          <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${bgClass} ${borderClass} border`}></div>
        </div>
      </div>

      {mounted && isExpanded && createPortal(
        <ExpandedModule
          rect={rect}
          title={title}
          color={color}
          bgClass={bgClass}
          textClass={textClass}
          borderClass={borderClass}
          originalCardRef={cardRef}
          onClose={handleClose}
        />,
        document.body
      )}

      {mounted && showTerminal && createPortal(
        <TerminalContact onClose={() => setShowTerminal(false)} />,
        document.body
      )}

      {/* Global feedback text — rendered once per card but only visible on events */}
      {mounted && createPortal(<SystemFeedback />, document.body)}
    </>
  );
}

// --- Web Audio API: synthetic SFX helpers ---
function createAudioCtx() {
  if (typeof window === "undefined") return null;
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}

function playTone(ctx, { frequency = 880, type = "square", duration = 0.05, volume = 0.08, startDelay = 0 } = {}) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration);
    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration + 0.01);
  } catch { }
}

function playTypeTick(ctx) { playTone(ctx, { frequency: 600, type: "square", duration: 0.03, volume: 0.07 }); }
function playHoverBlip(ctx) { playTone(ctx, { frequency: 1200, type: "sine", duration: 0.04, volume: 0.06 }); }
function playClick(ctx) {
  playTone(ctx, { frequency: 800, type: "square", duration: 0.05, volume: 0.12 });
  playTone(ctx, { frequency: 1100, type: "square", duration: 0.05, volume: 0.10, startDelay: 0.05 });
}
function playSuccess(ctx) {
  playTone(ctx, { frequency: 1400, type: "sine", duration: 0.08, volume: 0.12 });
  playTone(ctx, { frequency: 1800, type: "sine", duration: 0.1, volume: 0.10, startDelay: 0.08 });
}

function TypewriterLine({ text, speed = 35, onDone, pulsing, className = "" }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioCtx();
    let i = 0;
    setDisplayed("");
    setDone(false);
    const tick = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      playTypeTick(audioCtxRef.current);
      if (i >= text.length) { clearInterval(tick); setDone(true); onDone?.(); }
    }, speed);
    return () => clearInterval(tick);
  }, [text]);

  return (
    <p className={`${pulsing && !done ? "animate-pulse" : ""} ${className} flex items-center gap-[2px]`}>
      {displayed}
      {!done && <span className="inline-block w-[7px] h-[14px] bg-neon-green/80 animate-pulse ml-[2px]" />}
    </p>
  );
}

function TerminalOption({ label, href, audioCtx }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    playClick(audioCtx);
    playArcadeSound("confirm");
    setClicked(true);
    setTimeout(() => { playSuccess(audioCtx); window.open(href, "_blank"); setClicked(false); }, 150);
  };

  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => { setHovered(true); playHoverBlip(audioCtx); }}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 p-2 -mx-2 font-pixel text-sm select-none"
      style={{
        color: hovered ? "#ffffff" : "rgba(0,255,100,0.9)",
        textShadow: hovered ? "0 0 12px #fff, 0 0 24px rgba(0,255,100,0.6)" : "0 0 5px rgba(0,255,100,0.7)",
        transform: `translateX(${hovered ? "4px" : "0"}) scale(${clicked ? 0.96 : 1})`,
        background: hovered ? "rgba(0,255,100,0.05)" : "transparent",
        filter: clicked ? "brightness(1.4)" : "brightness(1)",
        transition: "all 0.12s ease",
      }}
    >
      <span style={{ color: hovered ? "rgba(0,255,100,1)" : "rgba(0,255,100,0.3)" }}>{hovered ? ">>" : "  "}</span>
      {label}
    </a>
  );
}

function TerminalContact({ onClose }) {
  const [phase, setPhase] = useState(0);

  const links = {
    1: 'https://www.instagram.com/_snehx.jit_/',
    2: 'https://mail.google.com/mail/?view=cm&fs=1&to=paulshuvam82@gmail.com',
    3: 'https://wa.me/916913733219?text=Hey%20Snehojit%2C%20I%20saw%20your%20portfolio',
    4: 'https://www.linkedin.com/in/snehojit-paul-908702328/'
  };

  const [cursorVisible, setCursorVisible] = useState(true);
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    audioCtxRef.current = createAudioCtx();
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;
    gsap.fromTo(boxRef.current,
      { opacity: 0, scale: 0.88, y: 18 },
      { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;
    const tl = gsap.to(boxRef.current, {
      filter: "brightness(1.05)",
      duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut"
    });
    return () => tl.kill();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    if (!boxRef.current) { onClose(); return; }
    gsap.to(boxRef.current, {
      opacity: 0, scale: 0.9, y: 14, duration: 0.22, ease: "power2.in",
      onComplete: onClose
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (phase >= 4) {
        const open = (url) => { playClick(audioCtxRef.current); setTimeout(() => { playSuccess(audioCtxRef.current); window.open(url, '_blank'); }, 120); };
        if (e.key === "1") open(links[1]);
        if (e.key === "2") open(links[2]);
        if (e.key === "3") open(links[3]);
        if (e.key === "4") open(links[4]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 cursor-pointer"
      onClick={handleClose}
      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,5,0.94) 100%)" }}
    >
      {/* Soft radial glow behind terminal */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: "560px", height: "560px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,80,0.06) 0%, transparent 70%)", filter: "blur(30px)"
        }} />
      </div>

      <div
        ref={boxRef}
        className="relative w-full max-w-[500px] bg-[#05050a] border border-neon-green/40 flex flex-col p-8 cursor-default overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(0,255,80,0.10), inset 0 0 40px rgba(0,255,100,0.04)", opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,0,0.025) 3px, rgba(0,255,0,0.025) 4px)"
        }} />

        {/* Close button */}
        <button onClick={handleClose} className="absolute top-3 right-4 z-20 font-pixel text-neon-green/40 hover:text-neon-green text-xs transition-colors">[X]</button>

        {/* Header bar */}
        <div className="border-b border-neon-green/20 pb-3 mb-5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <span className="w-2 h-2 rounded-full bg-neon-green/60" />
          </div>
          <span className="font-pixel text-[10px] text-neon-green/30 tracking-widest">TERMINAL v4.2.0</span>
        </div>

        <div className="relative z-10 font-pixel text-neon-green text-sm flex flex-col gap-3" style={{ textShadow: "0 0 8px rgba(0,255,100,0.6)" }}>
          {phase >= 0 && <TypewriterLine text="INITIALIZING SYSTEM..." speed={40} pulsing onDone={() => setPhase(1)} className="text-neon-green/80" />}
          {phase >= 1 && <TypewriterLine text="LOADING NETWORK..." speed={38} onDone={() => setPhase(2)} className="text-neon-green/80" />}
          {phase >= 2 && <TypewriterLine text="ACCESS GRANTED" speed={45} onDone={() => setPhase(3)} className="text-neon-green" />}
          {phase >= 3 && <TypewriterLine text="SELECT CHANNEL:" speed={42} onDone={() => setPhase(4)} className="text-white mt-3" />}

          {phase >= 4 && (
            <div className="flex flex-col gap-1 mt-2">
              <TerminalOption label="[01] INSTAGRAM" href={links[1]} audioCtx={audioCtxRef.current} />
              <TerminalOption label="[02] EMAIL" href={links[2]} audioCtx={audioCtxRef.current} />
              <TerminalOption label="[03] WHATSAPP" href={links[3]} audioCtx={audioCtxRef.current} />
              <TerminalOption label="[04] LINKEDIN" href={links[4]} audioCtx={audioCtxRef.current} />
            </div>
          )}

          <div className="mt-5 flex items-center gap-1 text-neon-green/40 text-xs">
            <span>$&gt;</span>
            <span style={{ opacity: cursorVisible ? 1 : 0, transition: "opacity 0.1s" }}
              className="inline-block w-[8px] h-[14px] bg-neon-green/60 ml-1" />
          </div>
          <p className="text-[9px] text-neon-green/20 mt-2 tracking-widest">ESC TO DISCONNECT · CLICK OUTSIDE TO EXIT</p>
        </div>
      </div>
    </div>
  );
}

function LongFormPlayer() {
  const videos = [
    "https://player.vimeo.com/video/1176429639",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => { playArcadeSound("switch"); setCurrentIndex((i) => (i - 1 + videos.length) % videos.length); };
  const next = () => { playArcadeSound("switch"); setCurrentIndex((i) => (i + 1) % videos.length); };

  return (
    <div className="flex flex-col items-center w-full max-w-full">
      {/* video-wrapper enforces 16:9 and prevents iframe overflow */}
      <div
        className="video-wrapper long relative overflow-hidden border border-white/10 bg-black/40"
      >
        <iframe
          src={videos[currentIndex]}
          style={{ width: "100%", height: "100%", display: "block", border: 0 }}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
        />
        {videos.length > 1 && (
          <>
            <div
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer text-white/60 hover:text-white text-xl select-none transition-colors"
            >
              ◀
            </div>
            <div
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer text-white/60 hover:text-white text-xl select-none transition-colors"
            >
              ▶
            </div>
          </>
        )}
      </div>
      <a
        href="https://vimeo.com/1176429639"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-white/30 mt-3 hover:text-white/60 transition-colors duration-150"
      >
        ↗ Open in Vimeo
      </a>
    </div>
  );
}

function ShortFormPlayer() {
  const videos = [
    "https://player.vimeo.com/video/1176429556",
    "https://player.vimeo.com/video/1176429430",
    "https://player.vimeo.com/video/1176429474",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => { playArcadeSound("switch"); setCurrentIndex((i) => (i - 1 + videos.length) % videos.length); };
  const next = () => { playArcadeSound("switch"); setCurrentIndex((i) => (i + 1) % videos.length); };

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-full pointer-events-auto">
      <div className="w-full flex items-center justify-center">
        {/* video-wrapper: 9:16 short-form, locked inside new nested CSS classes */}
        <div className="video-wrapper short">
          <div className="video-wrapper short-inner relative bg-black overflow-hidden border border-white/10">
            <iframe
              src={videos[currentIndex]}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
            <div
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer text-white/60 hover:text-white text-xl select-none transition-colors"
            >
              ◀
            </div>
            <div
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer text-white/60 hover:text-white text-xl select-none transition-colors"
            >
              ▶
            </div>
          </div>
        </div>
      </div>
      <p className="font-pixel text-[10px] text-white/30 mt-3">
        {currentIndex + 1} / {videos.length}
      </p>
    </div>
  );
}

function ExpandedModule({ rect, title, color, bgClass, textClass, borderClass, onClose, originalCardRef }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Pause ambient while video is visible
    const ambient = typeof window !== "undefined" ? window.__ambientAudio : null;
    if (ambient) ambient.pause();

    // Lock body scroll logically
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline();

    // Dim background & backdrop blur
    tl.to(overlayRef.current, {
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      duration: 0.5,
      ease: "power2.out"
    }, 0);

    // Initial rect position
    gsap.set(contentRef.current, {
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      transformOrigin: "center center"
    });

    // Animate to center screen
    tl.to(contentRef.current, {
      top: "50%",
      left: "50%",
      width: "80vw", // Cinema expanded view
      height: "85vh",
      xPercent: -50,
      yPercent: -50,
      duration: 0.8,
      ease: "power3.out"
    }, 0);

    // Dynamic Scale effect 1 -> 1.15 -> 1
    gsap.timeline()
      .to(contentRef.current, { scale: 1.15, duration: 0.4, ease: "power2.out" })
      .to(contentRef.current, { scale: 1, duration: 0.4, ease: "power3.out" });

    // Slight glow pulse on expand
    gsap.fromTo(contentRef.current,
      { boxShadow: `0 0 0px rgba(var(--color-${color}), 0)` },
      {
        boxShadow: `0 0 60px rgba(var(--color-${color}), 0.4)`,
        duration: 0.8,
        ease: "power2.out"
      }
    );

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeExpanded();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      // Resume ambient when module closes
      const ambient = typeof window !== "undefined" ? window.__ambientAudio : null;
      if (ambient) ambient.play().catch(() => { });
    };
  }, []);

  const closeExpanded = () => {
    playArcadeSound("close");
    const currentRect = originalCardRef.current.getBoundingClientRect();

    // Smooth closure tracking back to target
    const tl = gsap.timeline({ onComplete: onClose });

    tl.to(contentRef.current, {
      top: currentRect.top,
      left: currentRect.left,
      width: currentRect.width,
      height: currentRect.height,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      duration: 0.5,
      ease: "power3.inOut"
    }, 0);

    tl.to(overlayRef.current, {
      backgroundColor: "rgba(0,0,0,0)",
      backdropFilter: "blur(0px)",
      opacity: 0,
      duration: 0.5
    }, 0);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] bg-transparent flex items-center justify-center cursor-pointer pointer-events-auto"
      onClick={closeExpanded}
      style={{ backdropFilter: "blur(0px)" }}
    >
      <div
        ref={contentRef}
        className={`relative ${borderClass} bg-[#06060c] flex flex-col items-start justify-start border shadow-2xl cursor-default`}
        style={{
          boxSizing: "border-box",
          overflow: "hidden",
          padding: "30px",
          width: "100%",
          maxWidth: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow & Scanlines Inner Wrapper */}
        <div className={`absolute inset-0 border border-transparent pointer-events-none z-0`}></div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}>
        </div>

        {/* Close Button UI */}
        <button
          onClick={closeExpanded}
          className={`absolute top-4 right-6 z-50 flex items-center justify-center font-pixel text-2xl transition-all ${textClass} hover:text-white hover:scale-125 active:scale-95`}
        >
          X
        </button>

        {/* Header Labeling */}
        <div className={`w-full text-center mb-[20px] bg-[#0a0a16] border-b ${borderClass} z-10 py-3`}>
          <h2 className={`font-pixel text-xl tracking-[0.3em] ${textClass} drop-shadow-[0_0_12px_currentColor]`}>
            {title} // EXPANDED_VIEW
          </h2>
        </div>

        {/* Cinematic Video Content Interior */}
        <div className="expanded-content relative z-10 w-full flex flex-col items-center justify-center gap-4" style={{ flex: "1 1 0", minHeight: 0 }}>

          {title.toLowerCase().includes("long form") && (
            <LongFormPlayer />
          )}

          {title.toLowerCase().includes("short form") && (
            <ShortFormPlayer />
          )}

          {!title.toLowerCase().includes("long form") && !title.toLowerCase().includes("short form") && (
            <div className={`w-[90%] h-[75%] border border-[var(--color-${color})/20] ${borderClass} bg-black/50 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_20px_inset_rgba(255,255,255,0.02)]`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
              <div className={`w-[80px] h-[80px] rounded-full border-2 border-white/20 flex items-center justify-center mb-6 transition-transform hover:scale-110 cursor-pointer`}>
                <div className={`w-0 h-0 border-t-[12px] border-t-transparent border-l-[18px] border-l-white border-b-[12px] border-b-transparent ml-2`}></div>
              </div>
              <p className={`font-pixel text-[10px] text-white/40 tracking-widest`}>NO SIGNAL // STANDBY</p>
            </div>
          )}

          <div className="w-[90%] flex justify-between items-center text-[10px] font-pixel text-white/30">
            <span>SYS.VERSION.4.2.0</span>
            <span className="animate-pulse text-red-500">_REC</span>
          </div>
        </div>

        {/* Corner Decorators */}
        <div className={`absolute bottom-3 left-3 w-4 h-4 rounded-full ${bgClass} ${borderClass} border`}></div>
        <div className={`absolute bottom-3 right-3 w-4 h-4 rounded-full ${bgClass} ${borderClass} border`}></div>
        <div className={`absolute top-3 left-3 w-4 h-4 rounded-full ${bgClass} ${borderClass} border`}></div>
      </div>
    </div>
  );
}
