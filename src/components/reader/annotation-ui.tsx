"use client"

import { CopyIcon, NotePencilIcon, ShareFatIcon, TrashIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { friendlyDay } from "@/lib/format"
import { HL_SOLID } from "@/lib/highlight"
import { HIGHLIGHT_COLORS } from "@/lib/store"
import type { Highlight, HighlightColor } from "@/lib/types"
import { cn } from "@/lib/utils"

const keep = (e: React.MouseEvent | React.PointerEvent) => e.preventDefault()

function ColorDots({ value, onPick }: { value?: HighlightColor; onPick: (c: HighlightColor) => void }) {
  return (
    <div className="flex items-center gap-1">
      {HIGHLIGHT_COLORS.map((c) => (
        <Tooltip key={c.id}>
          <TooltipTrigger asChild>
            <button
              onMouseDown={keep}
              onClick={() => onPick(c.id)}
              aria-label={`Highlight ${c.label.toLowerCase()}`}
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
            >
              <span
                className={cn(
                  "size-[18px] rounded-full ring-offset-2 ring-offset-popover transition-transform hover:scale-110",
                  HL_SOLID[c.id],
                  value === c.id && "ring-2 ring-foreground/70",
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>{c.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

function IconAction({ label, onClick, children, destructive }: { label: string; onClick: () => void; children: React.ReactNode; destructive?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onMouseDown={keep}
          onClick={onClick}
          aria-label={label}
          className={cn(destructive && "hover:bg-destructive/10 hover:text-destructive")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function SelectionToolbar({
  onHighlight,
  onNote,
  onCopy,
  onShare,
}: {
  onHighlight: (c: HighlightColor) => void
  onNote: () => void
  onCopy: () => void
  onShare: () => void
}) {
  return (
    <div className="flex items-center gap-0.5 p-1">
      <ColorDots onPick={onHighlight} />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
      <Button variant="ghost" size="sm" onMouseDown={keep} onClick={onNote} className="gap-1.5">
        <NotePencilIcon /> Note
      </Button>
      <IconAction label="Copy with citation" onClick={onCopy}>
        <CopyIcon />
      </IconAction>
      <IconAction label="Share to community" onClick={onShare}>
        <ShareFatIcon />
      </IconAction>
    </div>
  )
}

export function HighlightCard({
  highlight,
  autoFocusNote,
  onColor,
  onSaveNote,
  onDelete,
  onCopy,
  onShare,
}: {
  highlight: Highlight
  autoFocusNote?: boolean
  onColor: (c: HighlightColor) => void
  onSaveNote: (note: string) => void
  onDelete: () => void
  onCopy: () => void
  onShare: () => void
}) {
  const [note, setNote] = useState(highlight.note ?? "")
  const [editing, setEditing] = useState(autoFocusNote || !!highlight.note)
  const latest = useRef(note)
  useEffect(() => {
    latest.current = note
  }, [note])

  // Persist on unmount so closing the card never loses a draft.
  useEffect(() => {
    return () => {
      if ((latest.current ?? "") !== (highlight.note ?? "")) onSaveNote(latest.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full sm:w-[340px]">
      <div className="flex items-center gap-0.5 p-1">
        <ColorDots value={highlight.color} onPick={onColor} />
        <div className="ml-auto flex items-center">
          {!editing && (
            <IconAction label="Add note" onClick={() => setEditing(true)}>
              <NotePencilIcon />
            </IconAction>
          )}
          <IconAction label="Copy with citation" onClick={onCopy}>
            <CopyIcon />
          </IconAction>
          <IconAction label="Share to community" onClick={onShare}>
            <ShareFatIcon />
          </IconAction>
          <IconAction label="Remove highlight" onClick={onDelete} destructive>
            <TrashIcon />
          </IconAction>
        </div>
      </div>
      {editing && (
        <div className="border-t p-2.5">
          <Textarea
            autoFocus={autoFocusNote}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (highlight.note ?? "") && onSaveNote(note)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                onSaveNote(note)
                ;(e.target as HTMLTextAreaElement).blur()
              }
            }}
            placeholder="Write a note…"
            className="min-h-20 resize-none border-none bg-transparent px-1.5 py-1 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex items-center justify-between px-1.5 pt-1 text-[11px] text-muted-foreground">
            <span>{highlight.note ? `Edited ${friendlyDay(highlight.updatedAt)}` : "Notes are private to you"}</span>
            <span>Saves automatically</span>
          </div>
        </div>
      )}
    </div>
  )
}
