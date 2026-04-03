"use client";

export default function ArcadeEnding() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden py-32 border-t-[3px] border-[#00FF00]/40" style={{ minHeight: "80vh" }}>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 22%, 24%, 55% { opacity: 0.2; }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes neon-pulse {
          0%, 100% { text-shadow: 0 0 5px #00FF00, 0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 40px #00FF00; }
          50% { text-shadow: 0 0 2px #00FF00, 0 0 5px #00FF00, 0 0 10px #00FF00, 0 0 20px #00FF00; }
        }
        
        .scanline-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 10;
        }

        .scanline-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 10px;
          background: rgba(0, 255, 0, 0.1);
          opacity: 0.4;
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 11;
        }

        .text-flicker {
          animation: flicker 4s infinite;
        }

        .text-blink {
          animation: blink 1.5s infinite;
        }

        .text-neon-pulse {
          animation: neon-pulse 2s ease-in-out infinite;
        }
      `}} />

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #00FF00 39px, #00FF00 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #00FF00 39px, #00FF00 40px)' }}
      ></div>

      {/* Overlays */}
      <div className="scanline-overlay"></div>
      <div className="scanline-bar"></div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center space-y-12 text-center text-[#00FF00] font-pixel px-4">
        
        {/* Header */}
        <div className="text-sm md:text-md tracking-[0.3em] opacity-80 text-blink">
          --- SESSION COMPLETE ---
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-widest text-flicker text-neon-pulse my-8 leading-tight">
          THANK YOU<br/>FOR PLAYING
        </h1>

        {/* Credit */}
        <div className="text-lg md:text-2xl tracking-[0.2em] mt-8 mb-4 border-b border-[#00FF00]/30 pb-4">
          SNEHOJIT <span className="opacity-50 mx-2">//</span> VIDEO EDITOR
        </div>

        {/* Sub-status */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 text-xs md:text-sm tracking-widest opacity-60 mt-4">
          <p>SYSTEM STATUS: <span className="text-[#00FFaa]">STABLE</span></p>
          <p>LEVEL: <span className="text-yellow-400">LEGENDARY</span></p>
        </div>

        {/* Footer / Action */}
        <button 
          onClick={scrollToTop}
          className="mt-20 group relative overflow-hidden border border-[#00FF00] bg-transparent hover:bg-[#00FF00]/10 text-[#00FF00] px-8 py-4 transition-all duration-300 font-pixel text-sm md:text-base tracking-[0.2em] cursor-pointer"
        >
          <span className="relative z-10 group-hover:text-white transition-colors duration-300 text-blink group-hover:animate-none">
            [ INSERT COIN TO RESTART ]
          </span>
          <div className="absolute inset-0 w-0 bg-[#00FF00] transition-all duration-300 ease-out group-hover:w-full z-0"></div>
        </button>
        <p className="text-[10px] md:text-xs opacity-30 tracking-[0.4em] mt-4 uppercase">click to return upward</p>

      </div>
      
      {/* Decorative Nodes */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-[#00FF00] opacity-50 text-flicker"></div>
      <div className="absolute top-4 right-4 w-3 h-3 bg-[#00FF00] opacity-50 text-flicker"></div>
      <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#00FF00] opacity-50 text-flicker"></div>
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-[#00FF00] opacity-50 text-flicker"></div>
    </section>
  );
}
