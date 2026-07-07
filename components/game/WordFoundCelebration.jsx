"use client";
import { useEffect, useRef } from "react";
import { celebrateWordFound } from "@/lib/animations/celebrate-word-found";
import { useGameStore } from "@/stores/useGameStore";
export function WordFoundCelebration() {
    const foundWordIds = useGameStore((s) => s.foundWordIds);
    const phase = useGameStore((s) => s.phase);
    const prevCount = useRef(0);
    const originRef = useRef({ x: 0.5, y: 0.55 });
    useEffect(() => {
        const onPointerUp = (e) => {
            originRef.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            };
        };
        window.addEventListener("pointerup", onPointerUp);
        return () => window.removeEventListener("pointerup", onPointerUp);
    }, []);
    useEffect(() => {
        if (phase !== "playing") {
            prevCount.current = foundWordIds.length;
            return;
        }
        if (foundWordIds.length > prevCount.current) {
            void celebrateWordFound(originRef.current);
        }
        prevCount.current = foundWordIds.length;
    }, [foundWordIds, phase]);
    return null;
}
