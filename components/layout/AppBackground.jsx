"use client";
import { CursorSpotlight } from "@/components/motion/CursorSpotlight";
export function AppBackground({ showCursor = false }) {
    return (<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#050815]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07122a] via-[#050815] to-[#02040c]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(99,102,241,0.12),transparent_50%),radial-gradient(ellipse_at_50%_40%,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}/>
      {showCursor && <CursorSpotlight />}
    </div>);
}
