"use client";

import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { useGameStore } from "@/stores/useGameStore";

export function WordList() {
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const { words } = useWeekPuzzle();

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Words to Find
      </h3>
      <ul className="space-y-1">
        {words.map((word) => {
          const found = foundWordIds.includes(word.id);
          return (
            <li
              key={word.id}
              className={[
                "flex items-center gap-2 text-sm",
                found
                  ? "text-emerald-600 line-through dark:text-emerald-400"
                  : "text-zinc-700 dark:text-zinc-300",
              ].join(" ")}
            >
              <span className="font-mono font-semibold">{word.number}.</span>
              <span>{found ? word.word : "????????"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
