"use client";

import { useCallback, useRef } from "react";
import { cellKey } from "@/lib/game/word-search";
import { getSelectedCellKeys, useGameStore } from "@/stores/useGameStore";

function getCellCoords(target: EventTarget | null): { row: number; col: number } | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest("[data-row][data-col]");
  if (!(cell instanceof HTMLElement)) return null;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  if (Number.isNaN(row) || Number.isNaN(col)) return null;
  return { row, col };
}

export function WordSearchGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const grid = useGameStore((s) => s.grid);
  const foundCellKeys = useGameStore((s) => s.foundCellKeys);
  const currentSelection = useGameStore((s) => s.currentSelection);
  const phase = useGameStore((s) => s.phase);
  const startSelection = useGameStore((s) => s.startSelection);
  const extendSelection = useGameStore((s) => s.extendSelection);
  const endSelection = useGameStore((s) => s.endSelection);

  const selectedKeys = getSelectedCellKeys(currentSelection);
  const disabled = phase !== "playing";
  const cols = grid[0]?.length ?? 0;
  const rows = grid.length;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const coords = getCellCoords(e.target);
      if (!coords) return;

      e.preventDefault();
      gridRef.current?.setPointerCapture(e.pointerId);
      startSelection(coords.row, coords.col);
    },
    [disabled, startSelection]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !gridRef.current?.hasPointerCapture(e.pointerId)) return;

      const underPointer = document.elementFromPoint(e.clientX, e.clientY);
      const coords = getCellCoords(underPointer);
      if (!coords) return;

      extendSelection(coords.row, coords.col);
    },
    [disabled, extendSelection]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (gridRef.current?.hasPointerCapture(e.pointerId)) {
        gridRef.current.releasePointerCapture(e.pointerId);
      }
      endSelection();
    },
    [disabled, endSelection]
  );

  return (
    <div className="flex h-full min-h-0 w-full touch-none select-none items-center justify-center">
      <div className="aspect-square h-full max-h-full w-full max-w-full rounded-lg border border-[#4a4238] bg-[#1f1c18] p-1.5">
        <div
          ref={gridRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="grid h-full w-full gap-0.5 sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
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
                data-row={rowIndex}
                data-col={colIndex}
                disabled={disabled}
                className={[
                  "flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-[3px] border font-bold leading-none",
                  "text-[clamp(0.55rem,2vmin,0.85rem)]",
                  isFound
                    ? "border-[#5a8f7b]/60 bg-[#5a8f7b] text-white"
                    : isSelected
                      ? "border-[#c4704a]/50 bg-[#c4704a] text-white"
                      : "border-[#5c5348] bg-[#f4efe6] text-[#1a1714] hover:border-[#c4704a]/40 hover:bg-white",
                  disabled ? "cursor-default" : "cursor-pointer",
                ].join(" ")}
              >
                {letter}
              </button>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
