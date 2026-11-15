"use client"

import {
  ArrowSquareOutIcon,
  DownloadSimpleIcon,
  HighlighterIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { FadeIn } from "@/components/motion"
import { Page, PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { books } from "@/lib/books"
import { friendlyDay } from "@/lib/format"
import { HL_SOLID } from "@/lib/highlight"
import { HIGHLIGHT_COLORS, useAppStore, useMyData } from "@/lib/store"
import type { Highlight, HighlightColor } from "@/lib/types"
import { cn } from "@/lib/utils"

const book = books[0]

export default function NotebookPage() {
  const data = useMyData()
  const totalQuestions = book.chapters.reduce((n, c) => n + c.reflections.length, 0)
  const answered = Object.keys(data.reflections).length

  function exportMarkdown() {
    const lines = [`# ${book.title} — Notebook`, ""]
    for (const c of book.chapters) {
      const hs = data.highlights.filter((h) => h.chapterId === c.id).sort((a, b) => a.paragraph - b.paragraph || a.start - b.start)
      const rs = c.reflections.filter((q) => data.reflections[q.id])
      if (!hs.length && !rs.length) continue
      lines.push(`## ${c.number}. ${c.title}`, "")
      for (const h of hs) {
        lines.push(`> ${h.text}`, "")
        if (h.note) lines.push(`${h.note}`, "")
      }
      if (rs.length) {
        lines.push("### Reflections", "")
        for (const q of rs) lines.push(`**${q.text}**`, "", data.reflections[q.id].text, "")
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "the-highest-power-notebook.md"
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success("Notebook exported", { description: "Saved as a Markdown file." })
  }

  return (
    <Page narrow>
      <PageHeader
        title="Notebook"
        description={`${data.highlights.length} highlights and ${answered} reflections from ${book.title}.`}
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={exportMarkdown}>
                <DownloadSimpleIcon /> Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as Markdown</TooltipContent>
          </Tooltip>
        }
      />

      <FadeIn className="mt-8">
        <Tabs defaultValue="highlights">
          <TabsList>
            <TabsTrigger value="highlights" className="px-3">
              <HighlighterIcon /> Highlights <span className="text-muted-foreground tabular-nums">{data.highlights.length}</span>
            </TabsTrigger>
            <TabsTrigger value="reflections" className="px-3">
              <NotePencilIcon /> Reflections{" "}
              <span className="text-muted-foreground tabular-nums">
                {answered}/{totalQuestions}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="highlights" className="mt-5">
            <HighlightsTab />
          </TabsContent>
          <TabsContent value="reflections" className="mt-5">
            <ReflectionsTab />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </Page>
  )
}

function HighlightsTab() {
  const data = useMyData()
  const [query, setQuery] = useState("")
  const [chapter, setChapter] = useState("all")
  const [color, setColor] = useState<HighlightColor | null>(null)
  const [onlyNotes, setOnlyNotes] = useState(false)
  const [editing, setEditing] = useState<Highlight | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.highlights.filter(
      (h) =>
        (chapter === "all" || h.chapterId === chapter) &&
        (!color || h.color === color) &&
        (!onlyNotes || h.note) &&
        (!q || h.text.toLowerCase().includes(q) || h.note?.toLowerCase().includes(q)),
    )
  }, [data.highlights, query, chapter, color, onlyNotes])

  const grouped = book.chapters
    .map((c) => ({ chapter: c, items: filtered.filter((h) => h.chapterId === c.id).sort((a, b) => a.paragraph - b.paragraph || a.start - b.start) }))
    .filter((g) => g.items.length)

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search highlights and notes" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
        <div className="flex items-center gap-2">
          <Select value={chapter} onValueChange={setChapter}>
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chapters</SelectItem>
              {book.chapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.number}. {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex h-9 items-center gap-0.5 rounded-lg border px-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <Tooltip key={c.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setColor(color === c.id ? null : c.id)}
                    className={cn("flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted", color === c.id && "bg-muted")}
                    aria-pressed={color === c.id}
                    aria-label={`Filter ${c.label}`}
                  >
                    <span className={cn("size-3.5 rounded-full", HL_SOLID[c.id], color && color !== c.id && "opacity-30")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{color === c.id ? "Clear filter" : `Only ${c.label.toLowerCase()}`}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={onlyNotes ? "secondary" : "outline"} size="icon" className="size-9 shrink-0" onClick={() => setOnlyNotes((v) => !v)} aria-pressed={onlyNotes} aria-label="Only with notes">
                <NotePencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{onlyNotes ? "Show all" : "Only highlights with notes"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {grouped.length === 0 ? (
        <Empty className="mt-6 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HighlighterIcon />
            </EmptyMedia>
            <EmptyTitle>{data.highlights.length ? "No matches" : "No highlights yet"}</EmptyTitle>
            <EmptyDescription>{data.highlights.length ? "Try a different search or filter." : "Select any text while reading to highlight it or add a note."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-6 space-y-8">
          {grouped.map(({ chapter, items }) => (
            <section key={chapter.id}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold">
                  {chapter.number}. {chapter.title}
                </h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="divide-y divide-background rounded-2xl bg-panel">
                <AnimatePresence initial={false}>
                  {items.map((h) => (
                    <HighlightRow key={h.id} h={h} onEdit={() => setEditing(h)} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
      <EditNoteDialog highlight={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function HighlightRow({ h, onEdit }: { h: Highlight; onEdit: () => void }) {
  const remove = useAppStore((s) => s.removeHighlight)
  const add = useAppStore((s) => s.addHighlight)
  return (
    <motion.div layout exit={{ opacity: 0, height: 0 }} className="group relative flex gap-4 p-4">
      <span className={cn("w-[3px] shrink-0 rounded-full", HL_SOLID[h.color])} />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[17px] leading-snug">{h.text}</p>
        {h.note && <p className="mt-2.5 rounded-lg bg-background px-3 py-2 text-sm leading-relaxed">{h.note}</p>}
        <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          {friendlyDay(h.createdAt)}
          {h.note && (
            <Badge variant="secondary" className="h-[18px] rounded-[5px] px-1.5 text-[11px]">
              Note
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Open in reader">
              <Link href={`/read/${book.slug}/${h.chapterId}?p=${h.paragraph}`}>
                <ArrowSquareOutIcon />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open in reader</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit note">
              <PencilSimpleIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{h.note ? "Edit note" : "Add note"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete highlight"
              onClick={() => {
                remove(h.id)
                toast("Highlight removed", { action: { label: "Undo", onClick: () => add({ ...h }) } })
              }}
            >
              <TrashIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  )
}

function EditNoteDialog({ highlight, onClose }: { highlight: Highlight | null; onClose: () => void }) {
  const update = useAppStore((s) => s.updateHighlight)
  const [note, setNote] = useState("")
  const [lastId, setLastId] = useState<string | null>(null)
  if (highlight && highlight.id !== lastId) {
    setLastId(highlight.id)
    setNote(highlight.note ?? "")
  }
  const save = () => {
    if (!highlight) return
    update(highlight.id, { note: note.trim() || undefined })
    toast.success("Note saved")
    onClose()
  }
  return (
    <Dialog open={!!highlight} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{highlight?.note ? "Edit note" : "Add note"}</DialogTitle>
          <DialogDescription className="line-clamp-2 font-serif text-[15px]">“{highlight?.text}”</DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && save()}
          placeholder="What does this mean to you?"
          className="min-h-32"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReflectionsTab() {
  const data = useMyData()
  return (
    <div className="space-y-4">
      {book.chapters.map((c) => {
        const answered = c.reflections.filter((q) => data.reflections[q.id]).length
        return (
          <section key={c.id} className="rounded-2xl bg-panel">
            <div className="flex items-center justify-between gap-3 border-b border-background px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Chapter {c.number}</div>
                <h2 className="truncate text-[15px] font-semibold">{c.title}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn("text-xs tabular-nums", answered === c.reflections.length ? "text-foreground" : "text-muted-foreground")}>
                  {answered}/{c.reflections.length}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/read/${book.slug}/${c.id}`}>{answered ? "Edit" : "Answer"}</Link>
                </Button>
              </div>
            </div>
            <ol className="divide-y divide-background">
              {c.reflections.map((q, i) => {
                const a = data.reflections[q.id]
                return (
                  <li key={q.id} className="px-4 py-3.5 sm:px-5">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[11px] text-muted-foreground tabular-nums">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{q.text}</p>
                        {a ? (
                          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-foreground/80">{a.text}</p>
                        ) : (
                          <p className="mt-1.5 text-sm text-muted-foreground italic">Not answered yet</p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
