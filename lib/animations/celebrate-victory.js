export async function celebrateVictory() {
    if (typeof window === "undefined")
        return;
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#22d3ee", "#34d399", "#818cf8", "#f472b6", "#fbbf24", "#ffffff"];
    const duration = 2800;
    const end = Date.now() + duration;
    const frame = () => {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.65 },
            colors,
            zIndex: 9999,
            disableForReducedMotion: true,
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.65 },
            colors,
            zIndex: 9999,
            disableForReducedMotion: true,
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };
    confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.55 },
        startVelocity: 48,
        colors,
        zIndex: 9999,
        disableForReducedMotion: true,
    });
    confetti({
        particleCount: 80,
        spread: 360,
        origin: { x: 0.5, y: 0.45 },
        ticks: 200,
        scalar: 1.1,
        colors,
        zIndex: 9999,
        disableForReducedMotion: true,
    });
    frame();
    await new Promise((resolve) => setTimeout(resolve, duration));
}
