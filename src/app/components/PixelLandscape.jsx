"use client";

import React from "react";

export default function PixelLandscape({ type = "cyber-grid" }) {
    if (type === "cyber-grid") {
        return (
            <div className="w-[80vw] shrink-0 h-full flex flex-col justify-end relative z-0">
                {/* Animated Grid on the Ground Level */}
                 <div className="w-full h-[150px] absolute bottom-0 opacity-40" 
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(0, 255, 255, 0.4) 2px, transparent 2px)',
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) scale(2)',
                        transformOrigin: 'bottom center',
                    }}
                 ></div>
                 
                 {/* Floating Particles / Stars in BG */}
                 <div className="absolute top-[20%] left-[30%] w-[4px] h-[4px] bg-white rounded-full animate-ping"></div>
                 <div className="absolute top-[40%] left-[60%] w-[6px] h-[6px] bg-neon-pink rounded-full animate-pulse shadow-[0_0_10px_#ff00ff]"></div>
                 <div className="absolute top-[15%] left-[80%] w-[3px] h-[3px] bg-white rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
                 
                 <div className="w-full flex justify-center pb-20 z-10">
                    <p className="font-pixel text-neon-blue/40 text-sm tracking-[0.5em]">LOADING SECTOR...</p>
                 </div>
            </div>
        );
    }

    if (type === "retro-mountains") {
        return (
             <div className="w-[100vw] shrink-0 h-full flex flex-col justify-end relative z-0 overflow-hidden">
                {/* 8-bit aesthetic mountains */}
                <div className="absolute bottom-20 left-10 w-[200px] h-[150px] bg-[#1a0524] border-t-4 border-l-4 border-r-4 border-neon-pink/40 transform rotate-45 translate-y-[50%] skew-x-12 z-0"></div>
                <div className="absolute bottom-20 left-32 w-[300px] h-[200px] bg-[#220731] border-t-4 border-l-4 border-r-4 border-neon-blue/40 transform rotate-45 translate-y-[50%] skew-x-12 z-0"></div>
                <div className="absolute bottom-20 right-10 w-[250px] h-[180px] bg-[#1a0524] border-t-4 border-l-4 border-r-4 border-neon-pink/40 transform rotate-45 translate-y-[50%] skew-x-12 z-0"></div>
                
                <div className="w-full flex justify-center pb-24 z-10 relative">
                     <div className="w-[60%] h-[2px] bg-neon-pink/30 shadow-[0_0_8px_#ff00ff]"></div>
                </div>
            </div>
        );
    }

    return null;
}
