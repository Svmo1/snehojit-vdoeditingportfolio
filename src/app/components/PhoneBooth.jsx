"use client";
import ModuleCard from "./ModuleCard";

export default function PhoneBooth() {
    return (
        <div className="w-screen shrink-0 min-h-[85vh] my-[20px] flex flex-col justify-center items-center pb-8 scene-section relative text-white px-20">
            <ModuleCard title="CALL TERMINAL" color="neon-yellow" animateType="glitch">
                <div className="flex flex-col items-center justify-center w-full h-full pb-10 mt-12">
                    {/* Blinking Status Light */}
                    <div className="w-5 h-5 rounded-full bg-neon-yellow shadow-[0_0_20px_rgba(255,255,0,1)] animate-pulse mb-8 border border-white"></div>
                    
                    <h3 className="text-xl font-pixel text-neon-yellow drop-shadow-[0_0_8px_currentColor] text-center mb-16">
                        READY TO CONNECT
                    </h3>
                    
                    <button className="px-10 py-5 bg-neon-yellow text-black font-pixel text-sm hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,0,0.8)] hover:shadow-[0_0_30px_rgba(255,255,0,1)] transform hover:scale-105 active:scale-95 duration-200">
                        INITIATE CONTACT
                    </button>
                    
                    {/* Signal connecting dots animation */}
                    <div className="flex gap-3 mt-16 pb-4">
                        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
                        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style={{animationDelay: "450ms"}}></div>
                    </div>
                </div>
            </ModuleCard>
        </div>
    );
}
