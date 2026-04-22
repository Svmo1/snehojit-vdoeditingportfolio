"use client";

import React from "react";

export default function StreetProp({ type = "lamp" }) {
    if (type === "lamp") {
        return (
            <div className="flex flex-col items-center justify-end h-full pb-8 shrink-0 w-[200px] z-20">
                <div className="w-[10px] h-[150px] bg-gray-800 border-l border-r border-gray-600 relative">
                    {/* Lamp Head */}
                    <div className="absolute -top-10 -left-6 w-[40px] h-[10px] bg-gray-800 border border-gray-600"></div>
                    {/* Glowing Bulb */}
                    <div className="absolute -top-8 -left-4 w-[20px] h-[20px] bg-white rounded-full shadow-[0_0_20px_10px_rgba(255,255,255,0.8)] animate-pulse"></div>
                    {/* Base */}
                    <div className="absolute bottom-0 -left-2 w-[26px] h-[20px] bg-gray-900 border-t border-gray-600"></div>
                </div>
            </div>
        );
    }

    if (type === "billboard") {
        return (
            <div className="flex flex-col items-center justify-end h-full pb-8 shrink-0 w-[400px] z-20">
                {/* Billboard Board */}
                <div className="w-[250px] h-[120px] bg-black border-4 border-neon-pink shadow-[0_0_20px_rgba(255,0,255,0.4)] flex items-center justify-center p-2 mb-2">
                    <div className="w-full h-full border border-neon-pink/50 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-10 pointer-events-none"></div>
                        <h4 className="text-neon-pink font-pixel text-xl animate-pulse z-0">PRESS</h4>
                        <h4 className="text-white font-pixel text-lg z-0">START</h4>
                    </div>
                </div>
                {/* Legs */}
                <div className="flex space-x-12">
                    <div className="w-[10px] h-[80px] bg-gray-800 border-x border-gray-600"></div>
                    <div className="w-[10px] h-[80px] bg-gray-800 border-x border-gray-600"></div>
                </div>
            </div>
        );
    }

    if (type === "sign") {
        return (
            <div className="flex flex-col justify-end items-center h-full pb-8 shrink-0 w-[220px] z-10">
                <style>{`
                    @keyframes arrowPulse {
                        0%, 100% { opacity: 0.5; transform: translateX(0); }
                        50% { opacity: 1; transform: translateX(4px); }
                    }
                    .next-sign-arrow { animation: arrowPulse 1.2s ease-in-out infinite; }
                `}</style>
                <div className="relative">
                    <div className="w-[140px] h-[44px] bg-black border border-neon-yellow/70 shadow-[0_0_12px_rgba(255,255,0,0.35)] flex items-center justify-center gap-2 relative z-20">
                        <span className="font-pixel text-neon-yellow/80 text-[9px] tracking-widest">NEXT</span>
                        <span className="next-sign-arrow font-pixel text-neon-yellow text-sm">▶</span>
                    </div>
                    {/* Pole */}
                    <div className="w-[6px] h-[100px] bg-gray-800 mx-auto mt-[-2px] relative z-0 border-l border-gray-600"></div>
                </div>
            </div>
        );
    }

    return null;
}
