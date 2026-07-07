"use client";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useWeekPuzzle } from "@/hooks/useWeekPuzzle";
import { useGameStore } from "@/stores/useGameStore";
export function WordList() {
    const listRef = useRef(null);
    const prevFoundCount = useRef(0);
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const { words } = useWeekPuzzle();
    useGSAP(() => {
        const items = listRef.current?.querySelectorAll("[data-word-item]");
        if (!items?.length)
            return;
        gsap.from(items, {
            opacity: 0,
            y: 8,
            duration: 0.35,
            stagger: 0.04,
            delay: 0.4,
            ease: "power2.out",
        });
    }, { scope: listRef });
    useEffect(() => {
        if (foundWordIds.length <= prevFoundCount.current) {
            prevFoundCount.current = foundWordIds.length;
            return;
        }
        const lastId = foundWordIds[foundWordIds.length - 1];
        const el = listRef.current?.querySelector(`[data-word-id="${lastId}"]`);
        if (el) {
            gsap.fromTo(el, { scale: 1 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" });
        }
        prevFoundCount.current = foundWordIds.length;
    }, [foundWordIds]);
    return (<div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Words to Find
      </h3>
      <ul ref={listRef} className="space-y-1">
        {words.map((word) => {
            const found = foundWordIds.includes(word.id);
            return (<li key={word.id} data-word-item data-word-id={word.id} className={[
                    "flex items-center gap-2 text-sm",
                    found
                        ? "text-emerald-400 line-through"
                        : "text-slate-400",
                ].join(" ")}>
              <span className="font-mono font-semibold">{word.number}.</span>
              <span>{found ? word.word : "????????"}</span>
            </li>);
        })}
      </ul>
    </div>);
}
