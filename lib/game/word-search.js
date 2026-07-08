/** Forward-only: right, down, and diagonal ↘ */
const DIRECTIONS = [
    { dx: 1, dy: 0, name: "across" },
    { dx: 0, dy: 1, name: "down" },
    { dx: 1, dy: 1, name: "diagonal" },
];

const DIRECTION_PRIORITY = {
    diagonal: 0,
    down: 1,
    across: 2,
};

function createSeededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0)
        value += 2147483646;
    return () => {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
    };
}

function shuffleInPlace(items, random) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

function buildDirectionPlan(wordCount, random) {
    const plan = [];
    for (let i = 0; i < wordCount; i++) {
        plan.push(DIRECTIONS[i % DIRECTIONS.length]);
    }
    return shuffleInPlace(plan, random);
}

function randomLetter(random) {
    return String.fromCharCode(65 + Math.floor(random() * 26));
}

function canPlaceWord(grid, word, row, col, dx, dy) {
    const size = grid.length;
    for (let i = 0; i < word.length; i++) {
        const r = row + dy * i;
        const c = col + dx * i;
        if (r < 0 || c < 0 || r >= size || c >= size)
            return false;
        const existing = grid[r][c];
        if (existing !== "" && existing !== word[i])
            return false;
    }
    return true;
}

function placeWord(grid, word, row, col, dx, dy) {
    for (let i = 0; i < word.length; i++) {
        grid[row + dy * i][col + dx * i] = word[i];
    }
}

function tryPlaceWord(grid, word, gridSize, direction, random, maxAttempts = 300) {
    const { dx, dy } = direction;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const row = Math.floor(random() * gridSize);
        const col = Math.floor(random() * gridSize);
        if (canPlaceWord(grid, word, row, col, dx, dy)) {
            placeWord(grid, word, row, col, dx, dy);
            return { row, col, dx, dy, direction: direction.name };
        }
    }
    return null;
}

export function generateWordSearch(words, gridSize = 14, seed = 42) {
    const random = createSeededRandom(seed);
    const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ""));
    const placedWords = [];
    const sorted = [...words].sort((a, b) => b.word.length - a.word.length);
    const directionPlan = buildDirectionPlan(sorted.length, random);

    const placementTasks = sorted.map((puzzleWord, index) => ({
        puzzleWord,
        direction: directionPlan[index],
    }));

    placementTasks.sort(
        (a, b) =>
            DIRECTION_PRIORITY[a.direction.name] - DIRECTION_PRIORITY[b.direction.name]
    );

    for (const { puzzleWord, direction } of placementTasks) {
        const word = puzzleWord.word.toUpperCase();
        let placement =
            tryPlaceWord(grid, word, gridSize, direction, random) ??
            DIRECTIONS.reduce((found, fallbackDirection) => {
                if (found)
                    return found;
                if (fallbackDirection.name === direction.name)
                    return null;
                return tryPlaceWord(grid, word, gridSize, fallbackDirection, random, 200);
            }, null);

        if (!placement) {
            throw new Error(`Could not place word: ${word}`);
        }

        placedWords.push({
            ...puzzleWord,
            word,
            startRow: placement.row,
            startCol: placement.col,
            dx: placement.dx,
            dy: placement.dy,
            direction: placement.direction,
        });
    }

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === "") {
                grid[r][c] = randomLetter(random);
            }
        }
    }

    return { grid, placedWords };
}

export function getCellsForWord(word) {
    return Array.from({ length: word.word.length }, (_, i) => ({
        row: word.startRow + word.dy * i,
        col: word.startCol + word.dx * i,
    }));
}

export function positionsMatch(a, b) {
    if (a.length !== b.length)
        return false;
    const key = (p) => `${p.row},${p.col}`;
    const setA = new Set(a.map(key));
    return b.every((p) => setA.has(key(p)));
}

export function getSelectedWord(grid, selection) {
    return selection
        .map(({ row, col }) => grid[row][col])
        .join("");
}

function isAllowedSelectionDelta(dr, dc) {
    if (dr < 0 || dc < 0)
        return false;
    if (dr === 0 && dc === 0)
        return false;
    if (dr !== 0 && dc !== 0 && dr !== dc)
        return false;
    return true;
}

/** Straight line from anchor to current cell (right, down, or ↘ only). */
export function selectionFromAnchor(start, end) {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    if (dr === 0 && dc === 0)
        return [start];
    if (!isAllowedSelectionDelta(dr, dc))
        return null;
    const steps = Math.max(dr, dc);
    return Array.from({ length: steps + 1 }, (_, i) => ({
        row: start.row + i * (dr === 0 ? 0 : 1),
        col: start.col + i * (dc === 0 ? 0 : 1),
    }));
}

export function isValidSelection(selection) {
    if (selection.length < 2)
        return false;
    const line = selectionFromAnchor(selection[0], selection[selection.length - 1]);
    return line !== null && positionsMatch(line, selection);
}

export function findMatchingWord(placedWords, selection, selectedText) {
    for (const word of placedWords) {
        const cells = getCellsForWord(word);
        if (word.word === selectedText && positionsMatch(cells, selection)) {
            return word;
        }
    }
    return null;
}

export function cellKey(row, col) {
    return `${row}-${col}`;
}
