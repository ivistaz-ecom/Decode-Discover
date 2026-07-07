function createSeededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0)
        value += 2147483646;
    return () => {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
    };
}
function hashSeed(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash || 1;
}
/** Deterministic shuffle — same uid + week always yields the same question order. */
export function shuffleWordIds(wordIds, seed) {
    const random = createSeededRandom(hashSeed(seed));
    const result = [...wordIds];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
export function resolveQuestionOrder(wordIds, uid, weekNumber, savedOrder) {
    if (savedOrder &&
        savedOrder.length === wordIds.length &&
        savedOrder.every((id) => wordIds.includes(id))) {
        return savedOrder;
    }
    return shuffleWordIds(wordIds, `${uid}-week-${weekNumber}`);
}
