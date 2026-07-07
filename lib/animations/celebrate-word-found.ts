import type { Options as ConfettiOptions } from "canvas-confetti";

export interface CelebrationOrigin {
  x: number;
  y: number;
}

export async function celebrateWordFound(origin: CelebrationOrigin) {
  if (typeof window === "undefined") return;

  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#22d3ee", "#34d399", "#818cf8", "#f472b6", "#fbbf24", "#ffffff"];

  const base: ConfettiOptions = {
    origin,
    zIndex: 9999,
    colors,
    disableForReducedMotion: true,
  };

  confetti({
    ...base,
    particleCount: 70,
    spread: 55,
    startVelocity: 42,
    ticks: 140,
    scalar: 0.9,
  });

  confetti({
    ...base,
    particleCount: 40,
    spread: 100,
    startVelocity: 28,
    decay: 0.92,
    scalar: 0.75,
  });

  confetti({
    ...base,
    particleCount: 25,
    spread: 26,
    startVelocity: 52,
    scalar: 1.1,
  });

  confetti({
    ...base,
    particleCount: 35,
    angle: 60,
    spread: 50,
    origin: { x: Math.max(0.08, origin.x - 0.12), y: origin.y },
  });

  confetti({
    ...base,
    particleCount: 35,
    angle: 120,
    spread: 50,
    origin: { x: Math.min(0.92, origin.x + 0.12), y: origin.y },
  });
}
