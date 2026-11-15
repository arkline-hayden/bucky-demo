"use client"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellRingingIcon,
  BellSimpleIcon,
  ChatsCircleIcon,
  CheckIcon,
  ListIcon,
  NotebookIcon,
  XIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { BookCover } from "@/components/book-cover"
import { HighlightCard, SelectionToolbar } from "@/components/reader/annotation-ui"
import { Floating } from "@/components/reader/floating"
import { Paragraph } from "@/components/reader/paragraph"
import { NotesSheet, ReaderSettings, TocSheet } from "@/components/reader/reader-panels"
import { Reflections } from "@/components/reader/reflections"
import { ShareDialog, type ShareQuote } from "@/components/reader/share-dialog"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { books, chapterWords, getBook, getChapter, readingMinutes } from "@/lib/books"
import { releaseDate } from "@/lib/format"
import { bookFraction, pct } from "@/lib/progress"
import { useAppStore, useMyData } from "@/lib/store"
import type { Highlight, HighlightColor } from "@/lib/types"
import { cn } from "@/lib/utils"

const WIDTH = { narrow: "max-w-[600px]", normal: "max-w-[680px]", wide: "max-w-[800px]" }
const LEADING = { compact: 1.6, normal: 1.78, relaxed: 1.98 }

interface Selection {
  paragraph: number
  start: number
  end: number
  text: string
  range: Range
}

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

export function Reader({ slug, chapterId }: { slug: string; chapterId: string }) {
  const book = getBook(slug)!
  const chapter = getChapter(book, chapterId)!
  const prev = book.chapters[chapter.number - 2]
  const next = book.chapters[chapter.number]
  const router = useRouter()

  const data = useMyData()
  const prefs = data.readerPrefs
  const progress = data.progress[book.id]
  const completed = !!progress?.chapters[chapter.id]?.completedAt

  const recordPosition = useAppStore((s) => s.recordPosition)
  const completeChapter = useAppStore((s) => s.completeChapter)
  const addReadingMinute = useAppStore((s) => s.addReadingMinute)
  const addHighlight = useAppStore((s) => s.addHighlight)
  const updateHighlight = useAppStore((s) => s.updateHighlight)
  const removeHighlight = useAppStore((s) => s.removeHighlight)

  const highlights = useMemo(
    () => data.highlights.filter((h) => h.bookId === book.id && h.chapterId === chapter.id),
    [data.highlights, book.id, chapter.id],
  )
  const byParagraph = useMemo(() => {
    const map = new Map<number, Highlight[]>()
    for (const h of highlights) map.set(h.paragraph, [...(map.get(h.paragraph) ?? []), h])
    return map
  }, [highlights])

  const articleRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const tracking = useRef(false)
  const lastActivity = useRef(0)

  const [tocOpen, setTocOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [sel, setSel] = useState<Selection | null>(null)
  const [active, setActive] = useState<{ id: string; focusNote?: boolean } | null>(null)
  const [share, setShare] = useState<ShareQuote | null>(null)
  const [pill, setPill] = useState<null | "resume" | "jump">(null)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { scrollYProgress } = useScroll({ target: articleRef, offset: ["start 56px", "end end"] })
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  // ── Scrolling helpers ───────────────────────────────────────────
  const scrollToParagraph = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const el = document.querySelector<HTMLElement>(`[data-para-wrap="${i}"]`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 110
    window.scrollTo({ top, behavior })
    el.classList.remove("para-flash")
    void el.offsetWidth
    el.classList.add("para-flash")
  }, [])

  // ── Resume where you left off (or jump to ?p=) ──────────────────
  useEffect(() => {
    tracking.current = false
    lastActivity.current = Date.now()
    const snapshot = useAppStore.getState()
    const prog = snapshot.sessionUserId ? snapshot.userData[snapshot.sessionUserId]?.progress[book.id] : undefined
    const param = new URLSearchParams(window.location.search).get("p")
    let target: number | null = null
    let kind: "resume" | "jump" = "resume"
    if (param !== null && !Number.isNaN(Number(param))) {
      target = Number(param)
      kind = "jump"
    } else if (prog?.lastChapterId === chapter.id && !prog.chapters[chapter.id]?.completedAt && prog.lastParagraph > 0) {
      target = prog.lastParagraph
    }
    window.scrollTo({ top: 0 })
    if (target === null) {
      tracking.current = true
      return
    }
    const t1 = setTimeout(() => {
      scrollToParagraph(target!)
      setPill(kind)
    }, 450)
    const t2 = setTimeout(() => (tracking.current = true), 1600)
    const t3 = setTimeout(() => setPill(null), 7000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [book.id, chapter.id, scrollToParagraph])

  // ── Track position, header visibility, reading time ─────────────
  useEffect(() => {
    let raf = 0
    let save: ReturnType<typeof setTimeout>
    let lastY = window.scrollY
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        lastActivity.current = Date.now()
        const y = window.scrollY
        setScrolled(y > 8)
        if (y > 160 && y - lastY > 6 && tracking.current) setHeaderHidden(true)
        else if (lastY - y > 6 || y < 160) setHeaderHidden(false)
        lastY = y
        if (!tracking.current) return
        let current = 0
        for (const el of document.querySelectorAll<HTMLElement>("[data-para-wrap]")) {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.4) current = Number(el.dataset.paraWrap)
          else break
        }
        clearTimeout(save)
        save = setTimeout(() => recordPosition(book.id, chapter.id, current), 300)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    const minute = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActivity.current < 120_000) addReadingMinute()
    }, 60_000)
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
      clearTimeout(save)
      clearInterval(minute)
    }
  }, [book.id, chapter.id, recordPosition, addReadingMinute])

  // ── Completion when the end of the text comes into view ─────────
  useEffect(() => {
    const el = endRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || !tracking.current) return
      const st = useAppStore.getState()
      const done = st.sessionUserId && st.userData[st.sessionUserId]?.progress[book.id]?.chapters[chapter.id]?.completedAt
      if (done) return
      completeChapter(book.id, chapter.id, chapter.paragraphs.length - 1)
      const after = useAppStore.getState()
      const f = bookFraction(book, after.userData[after.sessionUserId!]?.progress[book.id])
      toast.success(`Chapter ${chapter.number} complete`, { description: `You're ${pct(f)}% through ${book.title}.` })
    })
    io.observe(el)
    return () => io.disconnect()
  }, [book, chapter, completeChapter])

  // ── Text selection → toolbar ────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const read = () => {
      const s = window.getSelection()
      if (!s || s.isCollapsed || s.rangeCount === 0) return setSel(null)
      const range = s.getRangeAt(0)
      const node = range.startContainer
      const startEl = (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element))?.closest<HTMLElement>("[data-p]")
      if (!startEl || !articleRef.current?.contains(startEl)) return setSel(null)
      const r = range.cloneRange()
      if (!startEl.contains(range.endContainer)) r.setEnd(startEl, startEl.childNodes.length)
      const pre = document.createRange()
      pre.selectNodeContents(startEl)
      pre.setEnd(r.startContainer, r.startOffset)
      const raw = r.toString()
      const text = raw.trim()
      if (text.length < 2) return setSel(null)
      const start = pre.toString().length + (raw.length - raw.trimStart().length)
      setActive(null)
      setSel({ paragraph: Number(startEl.dataset.p), start, end: start + text.length, text, range: r })
    }
    const soon = (ms: number) => () => {
      clearTimeout(timer)
      timer = setTimeout(read, ms)
    }
    const onUp = soon(10)
    const onChange = soon(400)
    document.addEventListener("mouseup", onUp)
    document.addEventListener("keyup", onUp)
    document.addEventListener("selectionchange", onChange)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("keyup", onUp)
      document.removeEventListener("selectionchange", onChange)
    }
  }, [])

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === "t") setTocOpen((o) => !o)
      else if (k === "n") setNotesOpen((o) => !o)
      else if (k === "[" && prev) router.push(`/read/${book.slug}/${prev.id}`)
      else if (k === "]" && next) router.push(`/read/${book.slug}/${next.id}`)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev, next, router, book.slug])

  // ── Annotation actions ─────────────────────────────────────────
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    setSel(null)
  }

  function createHighlight(color: HighlightColor) {
    if (!sel) return null
    // Merge with anything it overlaps so highlights never stack.
    const overlapping = (byParagraph.get(sel.paragraph) ?? []).filter((h) => h.start < sel.end && h.end > sel.start)
    const start = Math.min(sel.start, ...overlapping.map((h) => h.start))
    const end = Math.max(sel.end, ...overlapping.map((h) => h.end))
    const note = overlapping.map((h) => h.note).filter(Boolean).join("\n\n") || undefined
    overlapping.forEach((h) => removeHighlight(h.id))
    const id = addHighlight({
      bookId: book.id,
      chapterId: chapter.id,
      paragraph: sel.paragraph,
      start,
      end,
      text: chapter.paragraphs[sel.paragraph].slice(start, end),
      color: overlapping[0]?.color && color === "yellow" ? overlapping[0].color : color,
      note,
    })
    clearSelection()
    return id
  }

  function copy(text: string) {
    void navigator.clipboard?.writeText(`“${text}”\n— Bucky, ${book.title} (${chapter.title})`)
    toast("Copied with citation")
  }

  const shareQuote = (h: { text: string; paragraph: number }) =>
    setShare({ text: h.text, bookId: book.id, chapterId: chapter.id, paragraph: h.paragraph, chapterTitle: chapter.title })

  const getSelRect = useCallback(() => sel?.range.getBoundingClientRect() ?? null, [sel])
  const getActiveRect = useCallback(() => {
    if (!active) return null
    const rects = document.querySelector(`[data-hid="${active.id}"]`)?.getClientRects()
    return rects && rects.length ? rects[0] : null
  }, [active])
  const activeHighlight = active ? highlights.find((h) => h.id === active.id) : undefined

  const onOpenHighlight = useCallback((id: string) => setActive({ id }), [])

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Top bar ── */}
      <motion.header
        animate={{ y: headerHidden && !tocOpen && !notesOpen ? -64 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b bg-background transition-colors",
          scrolled ? "border-border" : "border-transparent",
        )}
      >
        <div className="flex h-14 items-center gap-1 px-2 sm:px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon-sm" aria-label="Back to book">
                <Link href={`/library/${book.slug}`}>
                  <ArrowLeftIcon className="size-[18px]" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to book</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setTocOpen(true)} aria-label="Chapters">
                <ListIcon className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Chapters <Kbd className="ml-1">T</Kbd>
            </TooltipContent>
          </Tooltip>

          <button onClick={() => setTocOpen(true)} className="mx-auto flex min-w-0 flex-col items-center px-2 text-center">
            <span className="hidden text-[11px] text-muted-foreground sm:block">{book.title}</span>
            <span className="max-w-[46vw] truncate text-[13px] font-medium sm:max-w-md">
              {chapter.number}. {chapter.title}
            </span>
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative" onClick={() => setNotesOpen(true)} aria-label="Notes and highlights">
                <NotebookIcon className="size-[18px]" />
                {highlights.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background tabular-nums">
                    {highlights.length}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Notes & highlights <Kbd className="ml-1">N</Kbd>
            </TooltipContent>
          </Tooltip>
          <ReaderSettings />
        </div>
        <motion.div className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-brand" style={{ scaleX: bar }} />
      </motion.header>

      {/* ── Text ── */}
      <main
        className={cn("mx-auto px-5 pt-24 pb-28 sm:px-8 sm:pt-28", WIDTH[prefs.width], prefs.font === "serif" ? "font-serif" : "font-sans")}
        style={{ ["--reader-size" as string]: `${prefs.fontSize}px`, ["--reader-leading" as string]: LEADING[prefs.leading] }}
      >
        <header className="mb-10">
          <h1 className={cn("text-[2.1rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-[2.5rem]", prefs.font === "serif" && "font-medium tracking-[-0.015em]")}>
            {chapter.title}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 font-sans text-[15px] text-muted-foreground">
            Chapter {chapter.number} of {book.chapters.length} · {readingMinutes(chapterWords(chapter))} min read
            {completed && (
              <span className="flex items-center gap-1">
                · <CheckIcon weight="bold" className="size-3.5" /> Finished
              </span>
            )}
          </p>
        </header>

        <article
          ref={articleRef}
          className="reader-prose text-foreground/90"
          onClick={(e) => {
            const mark = (e.target as Element).closest<HTMLElement>("[data-hid]")
            if (mark && window.getSelection()?.isCollapsed) setActive({ id: mark.dataset.hid! })
          }}
        >
          {chapter.paragraphs.map((text, i) => (
            <Paragraph key={i} index={i} text={text} highlights={byParagraph.get(i) ?? []} dropCap={i === 0 && text.length > 220} onOpenHighlight={onOpenHighlight} />
          ))}
        </article>
        <div ref={endRef} aria-hidden className="h-px" />

        <div className="my-14 h-px bg-border" aria-hidden />

        <Reflections chapter={chapter} />

        <ChapterFooter bookSlug={book.slug} prev={prev} next={next} />
      </main>

      {/* ── Floating annotation UI ── */}
      <AnimatePresence>
        {sel && (
          <Floating key="sel" getRect={getSelRect} onDismiss={() => setSel(null)} placement="top">
            <SelectionToolbar
              onHighlight={(c) => createHighlight(c)}
              onNote={() => {
                const id = createHighlight("yellow")
                if (id) setActive({ id, focusNote: true })
              }}
              onCopy={() => {
                copy(sel.text)
                clearSelection()
              }}
              onShare={() => {
                shareQuote(sel)
                clearSelection()
              }}
            />
          </Floating>
        )}
        {activeHighlight && (
          <Floating key={`hl-${activeHighlight.id}`} getRect={getActiveRect} onDismiss={() => setActive(null)} placement="bottom" dockOnMobile>
            <HighlightCard
              highlight={activeHighlight}
              autoFocusNote={active?.focusNote}
              onColor={(color) => updateHighlight(activeHighlight.id, { color })}
              onSaveNote={(note) => updateHighlight(activeHighlight.id, { note: note.trim() || undefined })}
              onDelete={() => {
                const snapshot = activeHighlight
                removeHighlight(snapshot.id)
                setActive(null)
                toast("Highlight removed", {
                  action: { label: "Undo", onClick: () => addHighlight({ ...snapshot }) },
                })
              }}
              onCopy={() => copy(activeHighlight.text)}
              onShare={() => {
                shareQuote(activeHighlight)
                setActive(null)
              }}
            />
          </Floating>
        )}
      </AnimatePresence>

      {/* ── Resume pill ── */}
      <AnimatePresence>
        {pill && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-40 flex items-center gap-1 rounded-full border bg-popover py-1 pr-1 pl-4 text-sm shadow-[0_8px_30px_-12px_rgb(0_0_0/0.3)]"
          >
            <span className="whitespace-nowrap">{pill === "resume" ? "Picked up where you left off" : "Jumped to your highlight"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" })
                setPill(null)
              }}
            >
              <ArrowUpIcon /> <span className="hidden sm:inline">Start of chapter</span>
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={() => setPill(null)} aria-label="Dismiss">
              <XIcon />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <TocSheet book={book} current={chapter} open={tocOpen} onOpenChange={setTocOpen} />
      <NotesSheet
        book={book}
        current={chapter}
        open={notesOpen}
        onOpenChange={setNotesOpen}
        onJump={(h) => {
          setNotesOpen(false)
          if (h.chapterId === chapter.id) setTimeout(() => scrollToParagraph(h.paragraph), 250)
          else router.push(`/read/${book.slug}/${h.chapterId}?p=${h.paragraph}`)
        }}
      />
      <ShareDialog quote={share} onOpenChange={(o) => !o && setShare(null)} />
    </div>
  )
}

function ChapterFooter({ bookSlug, prev, next }: { bookSlug: string; prev?: { id: string; number: number; title: string }; next?: { id: string; number: number; title: string } }) {
  const data = useMyData()
  const toggleNotify = useAppStore((s) => s.toggleNotifyBook)
  const book2 = books[1]
  const notify = data.notifyBooks.includes(book2.id)

  return (
    <div className="mt-14 font-sans">
      {next ? (
        <Link
          href={`/read/${bookSlug}/${next.id}`}
          className="group flex items-center justify-between gap-4 rounded-2xl bg-panel p-5 transition-colors hover:bg-muted sm:p-6"
        >
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Next · Chapter {next.number}</div>
            <div className="mt-1 truncate text-lg font-semibold tracking-[-0.02em]">{next.title}</div>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon />
          </span>
        </Link>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-panel">
          <div className="p-6 text-center sm:p-8">
            <h3 className="text-2xl font-semibold tracking-[-0.02em]">You finished Book 1.</h3>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-muted-foreground">This is where the journey begins. The next step is learning what it means to turn around. Book 2 arrives {book2.releaseDate && releaseDate(book2.releaseDate)}.</p>
          </div>
          <div className="flex flex-col items-center gap-4 border-t border-background p-5 sm:flex-row">
            <div className="w-12 shrink-0">
              <BookCover book={book2} detail="mark" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-sm font-medium">{book2.title}</div>
              <div className="text-xs text-muted-foreground">{book2.tagline}</div>
            </div>
            <Button
              variant={notify ? "secondary" : "default"}
              onClick={() => {
                toggleNotify(book2.id)
                toast(notify ? "Notifications off" : "You're on the list")
              }}
            >
              {notify ? <BellRingingIcon weight="fill" /> : <BellSimpleIcon />}
              {notify ? "Notifying you" : "Notify me"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        {prev ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link href={`/read/${bookSlug}/${prev.id}`}>
                  <ArrowLeftIcon /> <span className="max-w-[40vw] truncate">{prev.title}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Previous chapter <Kbd className="ml-1">[</Kbd>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span />
        )}
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/community/the-highest-power">
            <ChatsCircleIcon /> <span className="sm:hidden">Discuss</span><span className="hidden sm:inline">Discuss this chapter</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
