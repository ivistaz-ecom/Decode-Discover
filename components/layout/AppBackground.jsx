"use client";
import { CursorSpotlight } from "@/components/motion/CursorSpotlight";
export function AppBackground({ showCursor = false }) {
    return (<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#1a1714]"/>
      <div className="absolute inset-0 bg-gradient-to-b from-[#2c2620] via-[#1f1b17] to-[#14110e]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(196,112,74,0.09),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(90,143,123,0.07),transparent_50%)]"/>
      <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}/>
      {showCursor && <CursorSpotlight />}
    </div>);
}
