"use client"

import {
  ArrowLeftIcon,
  DesktopIcon,
  HighlighterIcon,
  MinusIcon,
  MoonIcon,
  NoteIcon,
  PlusIcon,
  SunIcon,
  TextAaIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useState } from "react"
import { BookCover } from "@/components/book-cover"
import { ProgressRing } from "@/components/progress-ring"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { chapterWords, readingMinutes } from "@/lib/books"
import { friendlyDay } from "@/lib/format"
import { HL_SOLID } from "@/lib/highlight"
import { bookFraction, chapterFraction, pct } from "@/lib/progress"
import { useAppStore, useMyData } from "@/lib/store"
import type { Book, Chapter, Highlight } from "@/lib/types"
import { cn } from "@/lib/utils"

// ── Reading settings ───────────────────────────────────────────────

export function ReaderSettings() {
  const prefs = useMyData().readerPrefs
  const set = useAppStore((s) => s.setReaderPrefs)
  const { theme, setTheme } = useTheme()
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Reading settings">
              <TextAaIcon className="size-[18px]" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Reading settings</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72 space-y-5 p-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Typeface</Label>
          <ToggleGroup type="single" variant="outline" className="w-full" value={prefs.font} onValueChange={(v) => v && set({ font: v as typeof prefs.font })}>
            <ToggleGroupItem value="sans" className="h-12 flex-1 flex-col gap-0 font-sans">
              <span className="text-lg leading-none">Aa</span>
              <span className="text-[11px] text-muted-foreground">DM Sans</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="serif" className="h-12 flex-1 flex-col gap-0 font-serif">
              <span className="text-lg leading-none">Aa</span>
              <span className="font-sans text-[11px] text-muted-foreground">Newsreader</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Text size</Label>
            <span className="text-xs text-muted-foreground tabular-nums">{prefs.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => set({ fontSize: Math.max(15, prefs.fontSize - 1) })} aria-label="Smaller text">
              <MinusIcon />
            </Button>
            <Slider min={15} max={26} step={1} value={[prefs.fontSize]} onValueChange={([v]) => set({ fontSize: v })} className="flex-1" />
            <Button variant="outline" size="icon-sm" onClick={() => set({ fontSize: Math.min(26, prefs.fontSize + 1) })} aria-label="Larger text">
              <PlusIcon />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Spacing</Label>
            <ToggleGroup type="single" variant="outline" size="sm" className="w-full" value={prefs.leading} onValueChange={(v) => v && set({ leading: v as typeof prefs.leading })}>
              {(["compact", "normal", "relaxed"] as const).map((l, i) => (
                <Tooltip key={l}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value={l} className="flex-1" aria-label={l}>
                      <span className="flex flex-col gap-[2px]" style={{ gap: 1 + i * 1.5 }}>
                        <span className="h-px w-3 bg-current" />
                        <span className="h-px w-3 bg-current" />
                        <span className="h-px w-3 bg-current" />
                      </span>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent className="capitalize">{l}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <ToggleGroup type="single" variant="outline" size="sm" className="w-full" value={prefs.width} onValueChange={(v) => v && set({ width: v as typeof prefs.width })}>
              {(["narrow", "normal", "wide"] as const).map((w, i) => (
                <Tooltip key={w}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value={w} className="flex-1" aria-label={w}>
                      <span className="h-2.5 rounded-[2px] border border-current" style={{ width: 6 + i * 4 }} />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent className="capitalize">{w}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Theme</Label>
          <ToggleGroup type="single" variant="outline" size="sm" className="w-full" value={theme} onValueChange={(v) => v && setTheme(v)}>
            <ToggleGroupItem value="light" className="flex-1 gap-1.5"><SunIcon /> Light</ToggleGroupItem>
            <ToggleGroupItem value="dark" className="flex-1 gap-1.5"><MoonIcon /> Dark</ToggleGroupItem>
            <ToggleGroupItem value="system" className="flex-1 gap-1.5"><DesktopIcon /> Auto</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Table of contents ─────────────────────────────────────────────

export function TocSheet({ book, current, open, onOpenChange }: { book: Book; current: Chapter; open: boolean; onOpenChange: (o: boolean) => void }) {
  const data = useMyData()
  const progress = data.progress[book.id]
  const percent = pct(bookFraction(book, progress))
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 shrink-0">
              <BookCover book={book} detail="mark" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">{book.title}</SheetTitle>
              <SheetDescription>Renewed · Book {book.number}</SheetDescription>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={percent} className="h-1 w-28" indicatorClassName="bg-brand" />
                <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
              </div>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="p-2">
            {book.chapters.map((c) => {
              const f = chapterFraction(c, progress)
              const active = c.id === current.id
              return (
                <Link
                  key={c.id}
                  href={`/read/${book.slug}/${c.id}`}
                  onClick={() => onOpenChange(false)}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted", active && "bg-muted")}
                >
                  <span className="w-4 text-right text-xs text-muted-foreground tabular-nums">{c.number}</span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm", active && "font-medium")}>{c.title}</div>
                    <div className="text-xs text-muted-foreground">{readingMinutes(chapterWords(c))} min</div>
                  </div>
                  <ProgressRing value={f} size={18} />
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-3">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href={`/library/${book.slug}`}>
              <ArrowLeftIcon /> Back to book
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Notes & highlights ────────────────────────────────────────────

export function NotesSheet({
  book,
  current,
  open,
  onOpenChange,
  onJump,
}: {
  book: Book
  current: Chapter
  open: boolean
  onOpenChange: (o: boolean) => void
  onJump: (h: Highlight) => void
}) {
  const all = useMyData().highlights.filter((h) => h.bookId === book.id)
  const [scope, setScope] = useState<"chapter" | "book">("chapter")
  const list = (scope === "chapter" ? all.filter((h) => h.chapterId === current.id) : all).sort((a, b) => {
    const ca = book.chapters.findIndex((c) => c.id === a.chapterId)
    const cb = book.chapters.findIndex((c) => c.id === b.chapterId)
    return ca - cb || a.paragraph - b.paragraph || a.start - b.start
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle>Notes & highlights</SheetTitle>
          <SheetDescription>Private to you. Select any text to add more.</SheetDescription>
          <ToggleGroup type="single" variant="outline" size="sm" className="mt-3 w-full" value={scope} onValueChange={(v) => v && setScope(v as typeof scope)}>
            <ToggleGroupItem value="chapter" className="flex-1">This chapter</ToggleGroupItem>
            <ToggleGroupItem value="book" className="flex-1">Whole book · {all.length}</ToggleGroupItem>
          </ToggleGroup>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          {list.length === 0 ? (
            <div className="flex flex-col items-center px-8 py-16 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <HighlighterIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="mt-4 text-sm font-medium">No highlights yet</div>
              <p className="mt-1 text-[13px] text-muted-foreground">Select a sentence in this chapter to highlight it or attach a note.</p>
            </div>
          ) : (
            <ul className="space-y-1 p-3">
              {list.map((h) => {
                const ch = book.chapters.find((c) => c.id === h.chapterId)
                return (
                  <li key={h.id}>
                    <button onClick={() => onJump(h)} className="w-full rounded-lg p-3 text-left transition-colors hover:bg-muted/70">
                      {scope === "book" && <div className="mb-1.5 text-xs text-muted-foreground">{ch?.number}. {ch?.title}</div>}
                      <div className="flex gap-3">
                        <span className={cn("w-[3px] shrink-0 rounded-full", HL_SOLID[h.color])} />
                        <div className="min-w-0">
                          <p className="font-serif text-[15px] leading-snug">{h.text}</p>
                          {h.note && (
                            <p className="mt-2 flex gap-1.5 text-[13px] text-muted-foreground">
                              <NoteIcon className="mt-0.5 size-3.5 shrink-0" />
                              {h.note}
                            </p>
                          )}
                          <div className="mt-2 text-[11px] text-muted-foreground">{friendlyDay(h.createdAt)}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
