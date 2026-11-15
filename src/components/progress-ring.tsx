import { CheckIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function ProgressRing({ value, size = 20, className }: { value: number; size?: number; className?: string }) {
  const stroke = 2
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  if (value >= 1) {
    return (
      <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-background", className)} style={{ width: size, height: size }}>
        <CheckIcon weight="bold" style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    )
  }
  return (
    <svg width={size} height={size} className={cn("shrink-0 -rotate-90", className)} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
      {value > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          className="stroke-brand transition-[stroke-dashoffset] duration-700"
        />
      )}
    </svg>
  )
}
