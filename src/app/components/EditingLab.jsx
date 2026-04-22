"use client";
import ModuleCard from "./ModuleCard";

export default function EditingLab() {
    return (
        <div className="w-screen shrink-0 min-h-[85vh] my-[20px] flex flex-col justify-center items-center pb-8 scene-section relative text-white px-20">
            <ModuleCard title="SHORT FORM" color="neon-green" animateType="slide-up">
                <p className="font-pixel text-sm text-gray-300 text-center leading-8 mb-8 px-4 mt-8">
                    REELS • TIKTOKS • SHORTS <br/><br/>
                    HIGH RETENTION RATE <br/>
                    DYNAMIC PACING
                </p>
                <div className="mt-auto mb-4 w-full px-8 flex flex-col gap-6">
                    <div className="h-2 w-full bg-neon-green/20 overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full w-[85%] bg-neon-green shadow-[0_0_10px_currentColor]"></div>
                    </div>
                    <button className="w-full py-4 border border-neon-green text-neon-green font-pixel text-xs hover:bg-neon-green hover:text-black transition-colors duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.6)]">
                        EXECUTE()
                    </button>
                </div>
            </ModuleCard>
        </div>
    );
}
