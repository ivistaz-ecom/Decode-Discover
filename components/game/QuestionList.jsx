"use client";
import { useGameStore } from "@/stores/useGameStore";
export function QuestionList() {
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const questionOrder = useGameStore((s) => s.questionOrder);
    const placedWords = useGameStore((s) => s.placedWords);
    const orderedWords = questionOrder
        .map((id) => placedWords.find((word) => word.id === id))
        .filter((word) => Boolean(word));
    return (<ol className="flex flex-col gap-2.5 py-1">
      {orderedWords.map((word, index) => {
            const found = foundWordIds.includes(word.id);
            return (<li key={word.id} className="flex items-start gap-1.5">
            <span className="shrink-0 text-sm font-semibold text-[#c9a86c] sm:text-base">
              {index + 1}.
            </span>
            <span className={[
                    "text-sm leading-snug sm:text-base sm:leading-normal",
                    found ? "text-[#7cb69a]" : "text-[#e8dfd3]",
                ].join(" ")}>
              {word.clue}
            </span>
          </li>);
        })}
    </ol>);
}
