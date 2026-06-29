"use client";

import { Modal } from "@/components/ui/Modal";
import type { PuzzleWord, SubmittedAnswer } from "@/types/game";

interface ReviewAnswersModalProps {
  open: boolean;
  onClose: () => void;
  submittedAnswers: SubmittedAnswer[];
  words: PuzzleWord[];
}

export function ReviewAnswersModal({
  open,
  onClose,
  submittedAnswers,
  words,
}: ReviewAnswersModalProps) {
  const answerMap = new Map(submittedAnswers.map((a) => [a.wordId, a]));
  const sorted = [...words].sort((a, b) => a.number - b.number);

  return (
    <Modal open={open} onClose={onClose} title="Review Answers" maxWidth="lg">
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        All questions with the correct answers from the newsletter.
      </p>
      <ul className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {sorted.map((word) => {
          const result = answerMap.get(word.id);
          const correct = result?.correct ?? false;

          return (
            <li
              key={word.id}
              className={[
                "rounded-lg border px-4 py-3",
                correct
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {word.number}. {word.direction}
                  </p>
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                    {word.clue}
                  </p>
                  <p className="mt-2 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Answer: {word.word}
                  </p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    correct
                      ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                      : "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
                  ].join(" ")}
                >
                  {correct ? "Found" : "Missed"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
