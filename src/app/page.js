"use client";

import { useState, useEffect } from "react";
import IntroScreen from "./components/IntroScreen";
import Scene from "./components/Scene";

export default function Home() {
  const [phase, setPhase] = useState("arcade");

  // Ensure scroll top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-black text-white selection:bg-neon-pink selection:text-white min-h-screen">
      
      {phase === "arcade" && (
        <IntroScreen onStart={() => setPhase("scene")} />
      )}
      
      {phase === "scene" && (
        <Scene />
      )}

    </main>
  );
}