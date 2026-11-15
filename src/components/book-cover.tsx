import type { Book, CoverMotif } from "@/lib/types"
import { cn } from "@/lib/utils"

function Motif({ motif, color }: { motif: CoverMotif; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (motif) {
    case "moon":
      return (
        <g>
          <path d="M54 24A26 26 0 1 0 54 76A31 31 0 0 1 54 24Z" fill={color} />
          {[[74, 30, 1.6], [82, 46, 1], [70, 60, 0.8], [22, 30, 1.1], [30, 20, 0.7], [18, 50, 0.8], [84, 22, 0.7]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.85} />
          ))}
          <path d="M10 88h80" {...common} opacity={0.5} />
        </g>
      )
    case "turn":
      return (
        <g {...common}>
          <path d="M30 80V45a20 20 0 0 1 40 0v12" />
          <path d="m60 50 10 10 10-10" />
          <circle cx="30" cy="84" r="2" fill={color} />
        </g>
      )
    case "mark":
      return (
        <g {...common}>
          {[8, 15, 22, 29, 36].map((r) => (
            <path key={r} d={`M${50 - r} 58a${r} ${r} 0 0 1 ${r * 2} 0`} opacity={1 - r / 60} />
          ))}
          <circle cx="50" cy="58" r="2.2" fill={color} />
        </g>
      )
    case "mountain":
      return (
        <g {...common}>
          <path d="M12 80 38 38l14 20 10-14 26 36Z" />
          <path d="m38 38-6 10 6 4 6-6" opacity={0.7} />
          <circle cx="72" cy="26" r="5" fill={color} stroke="none" />
        </g>
      )
    case "hands":
      return (
        <g {...common}>
          <circle cx="50" cy="24" r="5" />
          <path d="M50 29v52M36 40h28" />
          <path d="M24 64c2 12 14 18 26 18s24-6 26-18" />
          <path d="m20 68 4-5 5 4M80 68l-4-5-5 4" />
        </g>
      )
    case "mend":
      return (
        <g {...common}>
          <path d="M66 28a28 28 0 1 0 10 18" />
          <path d="M74 32a28 28 0 0 1 2.5 8" strokeDasharray="1 4" />
          <circle cx="50" cy="52" r="3" fill={color} stroke="none" />
        </g>
      )
    case "water":
      return (
        <g {...common}>
          {[44, 56, 68].map((y, i) => (
            <path key={y} d={`M14 ${y}c9-7 18-7 27 0s18 7 27 0 13-5 18-2`} opacity={1 - i * 0.25} />
          ))}
          <path d="M50 18c6 8 9 13 9 17a9 9 0 0 1-18 0c0-4 3-9 9-17Z" fill={color} stroke="none" />
        </g>
      )
  }
}

/**
 * detail: "mark" for thumbnails (motif only), "title" for mid sizes (motif + title),
 * "full" for large covers (series, motif, title, author). Text never renders under 11px.
 */
export function BookCover({ book, className, detail = "full" }: { book: Book; className?: string; detail?: "mark" | "title" | "full" }) {
  const { from, to, ink, accent, motif } = book.cover
  return (
    <div
      className={cn(
        "@container relative aspect-[2/3] w-full overflow-hidden rounded-[6px] select-none",
        "shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-8px_rgb(0_0_0/0.25)]",
        className,
      )}
      style={{ background: to, color: ink }}
      aria-label={`${book.title} cover`}
      role="img"
    >
      {/* spine */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[5%]" style={{ background: from }} />

      <div className={cn("relative flex h-full flex-col px-[11%] pt-[10%] pb-[10%]", detail === "mark" && "justify-center")}>
        {detail === "full" && (
          <div className="flex items-baseline justify-between font-serif text-[7cqw] italic opacity-80">
            <span>Renewed</span>
            <span className="not-italic tabular-nums">{book.number}</span>
          </div>
        )}
        <div className={cn("mx-auto w-[62%]", detail === "full" && "mt-[10%]", detail === "title" && "mt-[16%]", detail === "mark" && "w-[72%]")}>
          <svg viewBox="0 0 100 100" className="w-full" aria-hidden>
            <Motif motif={motif} color={accent} />
          </svg>
        </div>
        {detail !== "mark" && (
          <div className="mt-auto">
            <div className="font-serif text-[13cqw] leading-[0.98] font-normal tracking-[-0.02em] text-balance">{book.title}</div>
            {detail === "full" && (
              <>
                <div className="mt-[7%] h-px w-[22%]" style={{ background: accent }} />
                <div className="mt-[5%] font-serif text-[7cqw] opacity-80">Bucky</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
