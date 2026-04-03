"use client";
import ModuleCard from "./ModuleCard";

export default function CinemaBuilding() {
    return (
        <div className="w-screen shrink-0 min-h-[85vh] my-[40px] flex flex-col justify-center items-center pb-8 scene-section relative text-white px-20">
            <ModuleCard title="LONG FORM EDITS" color="neon-pink" animateType="expand">
                <div className="w-[90%] h-[160px] bg-black/60 border border-neon-pink/50 flex items-center justify-center relative overflow-hidden mb-8 mt-4 shadow-[inset_0_0_20px_rgba(255,0,255,0.2)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,255,0.1),_transparent_70%)]"></div>
                    <h3 className="text-2xl font-pixel text-neon-pink drop-shadow-[0_0_8px_currentColor] text-center">
                        CINEMATIC<br/>NARRATIVES
                    </h3>
                </div>
                <p className="font-pixel text-xs text-gray-300 text-center leading-8 px-6">
                    FEATURE FILMS <br/>
                    DOCUMENTARIES <br/>
                    STORY-DRIVEN PACING
                </p>
                <button className="mt-8 px-8 py-4 border border-neon-pink text-neon-pink font-pixel text-xs hover:bg-neon-pink hover:text-black transition-colors duration-300 shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)]">
                    [ VIEW PROJECTS ]
                </button>
            </ModuleCard>
        </div>
    );
}
