"use client";

import { cellKey } from "@/lib/game/word-search";
import { getSelectedCellKeys, useGameStore } from "@/stores/useGameStore";

export function WordSearchGrid() {
  const grid = useGameStore((s) => s.grid);
  const foundCellKeys = useGameStore((s) => s.foundCellKeys);
  const currentSelection = useGameStore((s) => s.currentSelection);
  const phase = useGameStore((s) => s.phase);
  const startSelection = useGameStore((s) => s.startSelection);
  const extendSelection = useGameStore((s) => s.extendSelection);
  const endSelection = useGameStore((s) => s.endSelection);
  const clearSelection = useGameStore((s) => s.clearSelection);

  const selectedKeys = getSelectedCellKeys(currentSelection);

  const disabled = phase !== "playing";

  const handlePointerDown = (row: number, col: number) => {
    if (disabled) return;
    startSelection(row, col);
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (disabled) return;
    extendSelection(row, col);
  };

  const handlePointerUp = () => {
    if (disabled) return;
    endSelection();
  };

  return (
    <div
      className="select-none overflow-x-auto"
      onPointerUp={handlePointerUp}
      onPointerLeave={clearSelection}
    >
      <div
        className="inline-grid gap-0.5 sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const key = cellKey(rowIndex, colIndex);
            const isFound = foundCellKeys.has(key);
            const isSelected = selectedKeys.has(key);

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(rowIndex, colIndex);
                }}
                onPointerEnter={() => handlePointerEnter(rowIndex, colIndex)}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded text-sm font-semibold transition sm:h-9 sm:w-9 sm:text-base",
                  isFound
                    ? "bg-emerald-500 text-white"
                    : isSelected
                      ? "bg-sky-400 text-white"
                      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
                  disabled ? "cursor-default" : "cursor-pointer touch-none",
                ].join(" ")}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
