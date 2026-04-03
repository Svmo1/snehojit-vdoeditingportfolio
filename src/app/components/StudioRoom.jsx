"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ModuleCard from "./ModuleCard";
import { playArcadeSound } from "../utils/audio";

export default function StudioRoom() {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && isImageModalOpen) {
                playArcadeSound("close");
                setIsImageModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isImageModalOpen]);

    const handleImageClick = () => {
        playArcadeSound("expand");
        setIsImageModalOpen(true);
    };

    const handleCloseModal = () => {
        playArcadeSound("close");
        setIsImageModalOpen(false);
    };

    return (
        <div className="w-screen shrink-0 min-h-[85vh] my-[40px] flex flex-col justify-center items-center pb-8 scene-section relative text-white px-20">
            <ModuleCard title="ABOUT ME" color="neon-blue" animateType="fade-scale">
                <div className="about-card">
                    <img
                        src="/images/profile.jpg"
                        alt="profile"
                        className="about-image cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={handleImageClick}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />

                    <p className="font-pixel text-xs text-gray-300 leading-8 px-6">
                        I am Snehojit, a passionate video editor dedicated to turning raw footage into cinematic visual experiences.
                    </p>

                    <span className="level-text">LEVEL: 99 EDITOR</span>
                </div>
            </ModuleCard>

            {mounted && isImageModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-pointer"
                    onClick={handleCloseModal}
                    style={{ animation: "profileFadeIn 0.2s ease-out forwards" }}
                >
                    <style>{`
                        @keyframes profileFadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes profileScaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    `}</style>
                    <img
                        src="/images/profile.jpg"
                        alt="profile zoom"
                        className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl border border-neon-blue shadow-[0_0_40px_rgba(0,255,255,0.4)] cursor-default"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: "profileScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                    />
                </div>,
                document.body
            )}
        </div>
    );
}
