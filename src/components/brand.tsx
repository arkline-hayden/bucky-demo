import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#13213a] text-[#f2d49b] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.2)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-[70%]">
        <path d="M17 6A10 10 0 1 0 17 26A12.5 12.5 0 0 1 17 6Z" fill="currentColor" />
        <circle cx="23.5" cy="10" r="1.1" fill="currentColor" opacity=".9" />
        <circle cx="26" cy="15.5" r=".7" fill="currentColor" opacity=".7" />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Renewed</span>
    </span>
  )
}
