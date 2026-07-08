const PARTY_COLORS = [
  "#38bdf8",
  "#60a5fa",
  "#818cf8",
  "#22d3ee",
  "#a78bfa",
  "#ffffff",
  "#ff6b9d",
  "#ffd166",
];

function firePartyPopper(confetti, { x, y, angle }) {
  confetti({
    particleCount: 55,
    angle,
    spread: 42,
    startVelocity: 52,
    decay: 0.88,
    gravity: 0.9,
    ticks: 160,
    origin: { x, y },
    colors: PARTY_COLORS,
    shapes: ["square", "circle"],
    scalar: 1.05,
    zIndex: 9999,
    disableForReducedMotion: true,
  });

  confetti({
    particleCount: 28,
    angle,
    spread: 28,
    startVelocity: 62,
    decay: 0.86,
    gravity: 0.75,
    ticks: 200,
    origin: { x, y },
    colors: PARTY_COLORS,
    shapes: ["square"],
    scalar: 0.85,
    flat: true,
    zIndex: 9999,
    disableForReducedMotion: true,
  });
}

export async function celebrateWordFound(origin) {
  if (typeof window === "undefined") return;

  const confetti = (await import("canvas-confetti")).default;
  const { x, y } = origin;

  // Left & right party poppers aimed toward the find
  firePartyPopper(confetti, { x: Math.max(0.05, x - 0.08), y: y + 0.04, angle: 60 });
  firePartyPopper(confetti, { x: Math.min(0.95, x + 0.08), y: y + 0.04, angle: 120 });

  // Main pop at the selection point
  firePartyPopper(confetti, { x, y, angle: 90 });

  // Quick follow-up burst — confetti rain from above
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 100,
      startVelocity: 24,
      origin: { x, y: Math.max(0.1, y - 0.05) },
      colors: PARTY_COLORS,
      shapes: ["circle", "square"],
      scalar: 0.9,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  }, 120);
}
