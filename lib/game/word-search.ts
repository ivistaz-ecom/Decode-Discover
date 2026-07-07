import type { CellPosition, PlacedWord, PuzzleWord } from "@/types/game";

/** Right, down, and one diagonal — no backward (left/up) placement */
const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
] as const;

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function randomLetter(random: () => number): string {
  return String.fromCharCode(65 + Math.floor(random() * 26));
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dx: number,
  dy: number
): boolean {
  const size = grid.length;

  for (let i = 0; i < word.length; i++) {
    const r = row + dy * i;
    const c = col + dx * i;
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    const existing = grid[r][c];
    if (existing !== "" && existing !== word[i]) return false;
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dx: number,
  dy: number
): void {
  for (let i = 0; i < word.length; i++) {
    grid[row + dy * i][col + dx * i] = word[i];
  }
}

export function generateWordSearch(
  words: PuzzleWord[],
  gridSize = 14,
  seed = 42
): { grid: string[][]; placedWords: PlacedWord[] } {
  const random = createSeededRandom(seed);
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => "")
  );
  const placedWords: PlacedWord[] = [];

  const sorted = [...words].sort((a, b) => b.word.length - a.word.length);

  for (const puzzleWord of sorted) {
    const word = puzzleWord.word.toUpperCase();
    let placed = false;

    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const { dx, dy } =
        DIRECTIONS[Math.floor(random() * DIRECTIONS.length)];
      const row = Math.floor(random() * gridSize);
      const col = Math.floor(random() * gridSize);

      if (canPlaceWord(grid, word, row, col, dx, dy)) {
        placeWord(grid, word, row, col, dx, dy);
        placedWords.push({
          ...puzzleWord,
          word,
          startRow: row,
          startCol: col,
          dx,
          dy,
        });
        placed = true;
      }
    }

    if (!placed) {
      throw new Error(`Could not place word: ${word}`);
    }
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

export function getCellsForWord(word: PlacedWord): CellPosition[] {
  return Array.from({ length: word.word.length }, (_, i) => ({
    row: word.startRow + word.dy * i,
    col: word.startCol + word.dx * i,
  }));
}

export function positionsMatch(
  a: CellPosition[],
  b: CellPosition[]
): boolean {
  if (a.length !== b.length) return false;
  const key = (p: CellPosition) => `${p.row},${p.col}`;
  const setA = new Set(a.map(key));
  return b.every((p) => setA.has(key(p)));
}

export function getSelectedWord(
  grid: string[][],
  selection: CellPosition[]
): string {
  return selection
    .map(({ row, col }) => grid[row][col])
    .join("");
}

function isAllowedSelectionDelta(dr: number, dc: number): boolean {
  if (dr < 0 || dc < 0) return false;
  if (dr === 0 && dc === 0) return false;
  if (dr !== 0 && dc !== 0 && dr !== dc) return false;
  return true;
}

/** Straight line from anchor to current cell (right, down, or ↘ only). */
export function selectionFromAnchor(
  start: CellPosition,
  end: CellPosition
): CellPosition[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  if (dr === 0 && dc === 0) return [start];
  if (!isAllowedSelectionDelta(dr, dc)) return null;

  const steps = Math.max(dr, dc);
  return Array.from({ length: steps + 1 }, (_, i) => ({
    row: start.row + i * (dr === 0 ? 0 : 1),
    col: start.col + i * (dc === 0 ? 0 : 1),
  }));
}

export function isValidSelection(selection: CellPosition[]): boolean {
  if (selection.length < 2) return false;
  const line = selectionFromAnchor(
    selection[0],
    selection[selection.length - 1]
  );
  return line !== null && positionsMatch(line, selection);
}

export function findMatchingWord(
  placedWords: PlacedWord[],
  selection: CellPosition[],
  selectedText: string
): PlacedWord | null {
  for (const word of placedWords) {
    const cells = getCellsForWord(word);
    if (word.word === selectedText && positionsMatch(cells, selection)) {
      return word;
    }
  }

  return null;
}

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}
