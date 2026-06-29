"use client";

import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { useGameStore } from "@/stores/useGameStore";

export function QuestionList() {
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const { words } = useWeekPuzzle();
  const sorted = [...words].sort((a, b) => a.number - b.number);

  return (
    <ol className="space-y-3">
      {sorted.map((word) => {
        const found = foundWordIds.includes(word.id);
        return (
          <li key={word.id} className="text-sm leading-relaxed">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {word.number}.
            </span>{" "}
            <span
              className={
                found
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-700 dark:text-zinc-300"
              }
            >
              {word.clue}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
