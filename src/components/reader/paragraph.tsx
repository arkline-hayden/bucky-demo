"use client"

import { NoteIcon } from "@phosphor-icons/react"
import { memo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HL_SOFT } from "@/lib/highlight"
import type { Highlight } from "@/lib/types"
import { cn } from "@/lib/utils"

function segments(text: string, highlights: Highlight[]) {
  const sorted = [...highlights].sort((a, b) => a.start - b.start)
  const out: React.ReactNode[] = []
  let pos = 0
  for (const h of sorted) {
    const s = Math.max(h.start, pos)
    const e = Math.min(h.end, text.length)
    if (e <= s) continue
    if (s > pos) out.push(text.slice(pos, s))
    out.push(
      <mark key={h.id} data-hid={h.id} className={cn("hl-mark", HL_SOFT[h.color], h.note && "has-note")}>
        {text.slice(s, e)}
      </mark>,
    )
    pos = e
  }
  if (pos < text.length) out.push(text.slice(pos))
  return out
}

export const Paragraph = memo(function Paragraph({
  index,
  text,
  highlights,
  dropCap,
  onOpenHighlight,
}: {
  index: number
  text: string
  highlights: Highlight[]
  dropCap?: boolean
  onOpenHighlight: (id: string) => void
}) {
  const noted = highlights.filter((h) => h.note)
  const isPrayer = text.startsWith("If you're ready, pray with me.")
  return (
    <div className="group/para relative -mx-3 rounded-lg px-3" data-para-wrap={index}>
      {noted.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onOpenHighlight(noted[0].id)}
              className="absolute top-[0.35em] -left-7 hidden size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex xl:-left-10"
              aria-label="View note"
            >
              <NoteIcon weight="duotone" className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-64">
            {noted[0].note}
          </TooltipContent>
        </Tooltip>
      )}
      <p
        data-p={index}
        className={cn(
          dropCap &&
            "first-letter:float-left first-letter:mt-[0.08em] first-letter:mr-2.5 first-letter:font-serif first-letter:text-[3.6em] first-letter:leading-[0.82] first-letter:font-medium",
          isPrayer && "border-l-2 border-foreground/20 pl-5 font-serif text-[1.06em] italic",
        )}
      >
        {segments(text, highlights)}
      </p>
    </div>
  )
})
