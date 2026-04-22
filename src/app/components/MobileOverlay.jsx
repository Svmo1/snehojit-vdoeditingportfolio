"use client";

import React, { useState, useEffect } from "react";

export default function MobileOverlay() {
  const [forceMobile, setForceMobile] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate stable CSS particles client-side to avoid Next.js hydration mismatch
    // INCREASED VISIBILITY: Slightly larger size, higher base opacity, less fade-out
    setParticles(
      Array.from({ length: 18 }).map(() => ({
        size: Math.random() * 2.0 + 1.2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.2 + 0.15,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * -15,
        animType: Math.floor(Math.random() * 3) // 0, 1, or 2
      }))
    );

    // Detect actual mobile devices via user agent — unaffected by screen size or zoom.
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      setForceMobile(true);
      document.body.classList.add('force-mobile-lock');
    }

    return () => {
      document.body.classList.remove('force-mobile-lock');
    };
  }, []);

  return (
    <div 
      className={`mobile-overlay-container ${forceMobile ? 'force-mobile' : ''} fixed inset-0 z-[999999] bg-[#050008] flex-col items-center justify-center p-6 text-center select-none hidden font-pixel overflow-hidden opacity-100`}
    >
      
      {/* 2A. BACKGROUND ENGINE: Ambient drifting gradient (brighter purple/blue/pink tones) */}
      <div 
        className="absolute inset-0 z-0 mix-blend-screen opacity-80"
        style={{
          background: 'radial-gradient(120% 120% at 50% 10%, #2a055c 0%, #15083a 35%, #0a112c 65%, #1e0924 100%)',
          animation: 'bgGradientDrift 10s ease-in-out infinite alternate',
          backgroundSize: '200% 200%'
        }}
      ></div>

      {/* 2C. Floating Ambient Particles (INCREASED VISIBILITY) */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white mix-blend-screen"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              boxShadow: `0 0 6px text-white`,
              animation: `particleFloat${p.animType} ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* 2B. Subtle CRT Noise Texture Level (INCREASED OPACITY TO ~0.12) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>

      {/* 1D. Vignette (edge darkening to simulate curvature) */}
      <div className="absolute inset-0 z-15 pointer-events-none" style={{ boxShadow: 'inset 0 0 130px rgba(0,0,0,0.98)' }}></div>

      {/* 1A. Scanlines */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none opacity-[0.12] mix-blend-overlay"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px'
        }}
      ></div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-40 flex flex-col items-center w-full max-w-[320px]">
        
        {/* ACCESS RESTRICTED - Neon Pink + Controlled Subtle Flicker + RGB Split */}
        <h1 
          className="text-neon-pink text-[22px] md:text-2xl mb-8 drop-shadow-[0_0_8px_rgba(255,0,255,0.7)] animate-subtle-flicker relative"
          style={{ 
            textShadow: "1px 0px 1px rgba(0,255,255,0.35), -1px 0px 1px rgba(255,0,0,0.35), 0 0 12px var(--color-neon-pink)" 
          }}
        >
          ACCESS RESTRICTED
        </h1>
        
        {/* DESKTOP EXPERIENCE REQUIRED - Stable White */}
        <p className="text-white text-[13px] md:text-sm leading-6 mb-4 drop-shadow-sm">
          DESKTOP EXPERIENCE REQUIRED
        </p>
        
        {/* THIS PORTFOLIO IS OPTIMIZED... - Dim Gray tone */}
        <p className="text-[#7aa2a9] text-[9px] md:text-[10px] leading-5 mb-14 px-2 tracking-wide opacity-60">
          THIS PORTFOLIO IS OPTIMIZED FOR PC / LAPTOP
        </p>

        {/* INSERT DESKTOP TO CONTINUE - Terminal Green + Blinking Cursor "_" */}
        <div 
          className="text-neon-green text-[11px] md:text-xs drop-shadow-[0_0_6px_rgba(0,255,0,0.6)] flex items-center tracking-wide" 
        >
          <span>&gt; INSERT DESKTOP TO CONTINUE</span>
          <span className="animate-[crtBlink_1s_step-end_infinite] ml-1">_</span>
        </div>
      </div>

      {/* 5. ANIMATION SYSTEM KEYFRAMES (Ambient + Text) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bgGradientDrift {
          0% { background-position: 0% 0%; filter: brightness(1.0); }
          50% { background-position: 100% 50%; filter: brightness(1.25); }
          100% { background-position: 50% 100%; filter: brightness(1.1); }
        }
        @keyframes particleFloat0 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(15px, -20px); }
        }
        @keyframes particleFloat1 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-15px, 20px); }
        }
        @keyframes particleFloat2 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 15px); }
        }
        @keyframes subtleFlicker {
          0%, 100% { opacity: 1; filter: brightness(1); text-shadow: 1px 0px 1px rgba(0,255,255,0.35), -1px 0px 1px rgba(255,0,0,0.35), 0 0 12px var(--color-neon-pink); }
          95% { opacity: 1; filter: brightness(1); }
          96% { opacity: 0.9; filter: brightness(1.15); text-shadow: 0 0 16px var(--color-neon-pink); }
          97% { opacity: 1; filter: brightness(1); }
          98% { opacity: 0.85; filter: brightness(0.9); text-shadow: 0 0 8px var(--color-neon-pink); }
          99% { opacity: 1; filter: brightness(1); }
        }
        @keyframes crtBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-subtle-flicker {
          animation: subtleFlicker 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
