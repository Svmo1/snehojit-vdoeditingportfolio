"use client";

let globalAudioCtx = null;
const getAudioCtx = () => {
    if (!globalAudioCtx) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            globalAudioCtx = new AudioContext();
        } catch (e) {}
    }
    return globalAudioCtx;
};

function _tone(ctx, { freq = 440, type = "square", dur = 0.05, vol = 0.08, delay = 0 } = {}) {
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.01);
    } catch (e) {}
}

export const playArcadeSound = (type = "tick") => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    if (type === "tick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);

    } else if (type === "focus") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(300, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.015, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc.start(); osc2.start();
        osc.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.3);

    } else if (type === "hover") {
        // Soft high blip
        _tone(ctx, { freq: 1200, type: "sine", dur: 0.04, vol: 0.05 });

    } else if (type === "click") {
        // Double punch
        _tone(ctx, { freq: 800,  type: "square", dur: 0.05, vol: 0.10 });
        _tone(ctx, { freq: 1100, type: "square", dur: 0.05, vol: 0.08, delay: 0.05 });

    } else if (type === "expand") {
        // Rising cinematic sweep
        _tone(ctx, { freq: 300,  type: "sine", dur: 0.15, vol: 0.07 });
        _tone(ctx, { freq: 600,  type: "sine", dur: 0.12, vol: 0.06, delay: 0.10 });
        _tone(ctx, { freq: 1000, type: "sine", dur: 0.10, vol: 0.05, delay: 0.20 });

    } else if (type === "close") {
        // Falling sweep
        _tone(ctx, { freq: 1000, type: "sine", dur: 0.10, vol: 0.05 });
        _tone(ctx, { freq: 500,  type: "sine", dur: 0.12, vol: 0.06, delay: 0.08 });
        _tone(ctx, { freq: 250,  type: "sine", dur: 0.15, vol: 0.07, delay: 0.18 });

    } else if (type === "switch") {
        // Quick tick-tock
        _tone(ctx, { freq: 900, type: "square", dur: 0.04, vol: 0.07 });
        _tone(ctx, { freq: 700, type: "square", dur: 0.04, vol: 0.06, delay: 0.05 });

    } else if (type === "confirm") {
        // Success chime
        _tone(ctx, { freq: 1400, type: "sine", dur: 0.08, vol: 0.10 });
        _tone(ctx, { freq: 1800, type: "sine", dur: 0.10, vol: 0.09, delay: 0.08 });
        _tone(ctx, { freq: 2200, type: "sine", dur: 0.10, vol: 0.07, delay: 0.16 });
    } else if (type === "error") {
        // Descending error buzz
        _tone(ctx, { freq: 400, type: "sawtooth", dur: 0.08, vol: 0.09 });
        _tone(ctx, { freq: 250, type: "sawtooth", dur: 0.10, vol: 0.08, delay: 0.09 });
    }
};
