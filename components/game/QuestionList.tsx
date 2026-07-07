"use client";

import { useGameStore } from "@/stores/useGameStore";
import type { PlacedWord } from "@/types/game";

export function QuestionList() {
  const foundWordIds = useGameStore((s) => s.foundWordIds);
  const questionOrder = useGameStore((s) => s.questionOrder);
  const placedWords = useGameStore((s) => s.placedWords);

  const orderedWords = questionOrder
    .map((id) => placedWords.find((word) => word.id === id))
    .filter((word): word is PlacedWord => Boolean(word));

  return (
    <ol className="flex min-h-0 flex-1 flex-col gap-1 py-1">
      {orderedWords.map((word, index) => {
        const found = foundWordIds.includes(word.id);
        return (
          <li
            key={word.id}
            className="flex min-h-0 flex-1 items-start leading-snug"
          >
            <span className="shrink-0 pr-1.5 text-[clamp(0.875rem,2vh,1.125rem)] font-semibold text-[#c9a86c]">
              {index + 1}.
            </span>
            <span
              className={[
                "text-[clamp(0.875rem,2vh,1.125rem)] leading-snug sm:leading-normal",
                found ? "text-[#7cb69a]" : "text-[#e8dfd3]",
              ].join(" ")}
            >
              {word.clue}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
