import { accentLabelClass, glassHeaderClass, pageSubtitleClass, pageTitleClass } from "@/lib/ui/app-theme";

export function PageHeader({
  title,
  subtitle,
  eyebrow = "Discover & Decode",
  actions,
  compact = false,
  className = "",
  maxWidthClass = "max-w-6xl",
}) {
  return (
    <header
      className={`relative overflow-hidden ${glassHeaderClass} ${compact ? "px-3 py-2.5 sm:px-4" : "px-4 py-5 sm:px-6"} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/[0.12] via-transparent to-cyan-400/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"
        aria-hidden
      />

      <div
        className={`relative mx-auto flex items-center justify-between gap-4 ${maxWidthClass}`}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className={`hidden shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.45)] sm:block ${compact ? "h-8 w-1" : "h-10 w-1.5"}`}
            aria-hidden
          />
          <div className="min-w-0">
            {eyebrow && (
              <p className={`${accentLabelClass} ${compact ? "text-[10px]" : ""}`}>
                {eyebrow}
              </p>
            )}
            <h1
              className={`${pageTitleClass} truncate ${compact ? "text-base sm:text-lg" : ""} ${eyebrow ? "mt-1" : ""}`}
            >
              {title}
            </h1>
            {subtitle && (
              <p className={`${pageSubtitleClass} truncate ${compact ? "text-[11px] sm:text-xs" : "mt-0.5"}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
