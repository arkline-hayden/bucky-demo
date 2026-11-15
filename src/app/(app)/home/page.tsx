"use client"

/*
 * Home answers one question: where did I leave off, and what's next?
 * Grid: a centred 1100px column, 12 columns × 77px + 11 × 16px gutters = 1100.
 * Rows span 3/3/3/3, then 9 + 3, then 6 + 6, so every internal edge meets one above it.
 */

import { ArrowRightIcon, BellRingingIcon, BellSimpleIcon, ChatCircleIcon, HeartIcon, PlayIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import { BookCover } from "@/components/book-cover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { books, chapterWords, readingMinutes } from "@/lib/books"
import { greeting, shortRelease, timeAgo } from "@/lib/format"
import { HL_SOLID } from "@/lib/highlight"
import { bookFraction, chapterFraction, completedChapters, currentStreak, dayKey, minutesLeft, pct, resumeTarget } from "@/lib/progress"
import { channels } from "@/lib/seed"
import { useAppStore, useMe, useMyData, useUsersById } from "@/lib/store"
import { cn } from "@/lib/utils"

const book = books[0]

export default function HomePage() {
  const me = useMe()!
  const data = useMyData()
  const progress = data.progress[book.id]
  const percent = pct(bookFraction(book, progress))
  const { chapter } = resumeTarget(book, progress)
  const firstName = me.displayName.split(" ")[0]
  const started = percent > 0

  useEffect(() => {
    try {
      const key = `renewed-welcomed-${me.id}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
      if (started) toast(`Welcome back, ${firstName}`, { description: `You're ${percent}% through ${book.title}.` })
    } catch {}
  }, [me.id, started, percent, firstName])

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-7 pb-16 sm:px-6 md:pt-12 xl:px-0">
      {/* Title row: the greeting carries today's one fact; the main job is one click away */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-medium tracking-[-0.025em] sm:text-[28px]">
            {greeting()}, {firstName}.
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            {today}.{" "}
            {started ? (
              <>
                You left off in <span className="text-foreground">{chapter.title}</span>, chapter {chapter.number} of {book.title}.
              </>
            ) : (
              <>Start with the Introduction to {book.title}.</>
            )}
          </p>
        </div>
        <Button asChild size="lg" className="h-9 shrink-0 self-start px-3.5 sm:self-auto">
          <Link href={`/read/${book.slug}/${chapter.id}`}>
            <PlayIcon weight="fill" />
            {started ? "Continue reading" : "Start reading"}
          </Link>
        </Button>
      </div>

      <Counts />

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <ContinueCard />
        <ComingUp />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-12">
        <CommunityPanel />
        <HighlightsPanel />
      </div>
    </div>
  )
}

// ── Count tiles ───────────────────────────────────────────────────

function Counts() {
  const data = useMyData()
  const progress = data.progress[book.id]
  const streak = currentStreak(data.readingLog)
  const readToday = !!data.readingLog[dayKey(new Date())]
  const notes = data.highlights.filter((h) => h.note).length
  const totalQuestions = book.chapters.reduce((n, c) => n + c.reflections.length, 0)
  const answered = book.chapters.flatMap((c) => c.reflections).filter((q) => data.reflections[q.id]).length
  const done = completedChapters(book, progress)
  const weekMinutes = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return data.readingLog[dayKey(d)] ?? 0
  }).reduce((a, b) => a + b, 0)

  const tiles = [
    { label: "This week", value: weekMinutes, unit: " min", caption: `${done} of ${book.chapters.length} chapters done` },
    { label: "Reading streak", value: streak, unit: streak === 1 ? " day" : " days", caption: readToday || streak === 0 ? "Keep showing up" : "Read today to keep it going" },
    { label: "Highlights", value: data.highlights.length, unit: "", caption: notes ? `${notes} with a note` : "Select text while reading" },
    { label: "Reflections", value: answered, unit: ` / ${totalQuestions}`, caption: "Private to you" },
  ]

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="flex min-h-[116px] flex-col justify-between rounded-2xl bg-panel p-4 lg:h-[128px]">
          <div className="text-[13px] text-muted-foreground">{t.label}</div>
          <div>
            <div className="text-[28px] leading-none font-normal tracking-[-0.02em] tabular-nums">
              {t.value}
              <span className="text-[15px] tracking-normal text-muted-foreground">{t.unit}</span>
            </div>
            <div className="mt-2 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{t.caption}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Continue reading (the one white card) ─────────────────────────

function ContinueCard() {
  const data = useMyData()
  const progress = data.progress[book.id]
  const { chapter } = resumeTarget(book, progress)
  const left = minutesLeft(book, progress)
  const upcoming = book.chapters.slice(chapter.number - 1, chapter.number + 2)

  return (
    <section aria-labelledby="continue-heading" className="rounded-2xl border bg-card p-5 sm:p-6 lg:col-span-9">
      <div className="flex gap-5 sm:gap-6">
        <Link href={`/library/${book.slug}`} className="w-[72px] shrink-0 sm:w-28" aria-label={`${book.title} details`}>
          <BookCover book={book} detail="mark" className="sm:hidden" />
          <BookCover book={book} detail="title" className="hidden sm:block" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="continue-heading" className="truncate text-lg font-semibold tracking-[-0.015em]">
                {book.title}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Renewed, book 1 of 7 · about {left} min left</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="-mr-2 hidden text-muted-foreground sm:inline-flex">
              <Link href={`/library/${book.slug}`}>
                All chapters <ArrowRightIcon />
              </Link>
            </Button>
          </div>
          <div className="hidden sm:block">
            <ChapterStrip activeId={chapter.id} />
          </div>
        </div>
      </div>
      <div className="sm:hidden">
        <ChapterStrip activeId={chapter.id} />
      </div>

      <ul className="mt-5 space-y-1 sm:mt-6">
        {upcoming.map((c) => {
          const f = chapterFraction(c, progress)
          const current = c.id === chapter.id
          return (
            <li key={c.id}>
              <Link
                href={`/read/${book.slug}/${c.id}`}
                className={cn(
                  "-mx-2 flex h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-muted",
                  current && "bg-muted/60",
                )}
              >
                <span className="w-5 text-right text-muted-foreground tabular-nums">{c.number}</span>
                <span className={cn("min-w-0 flex-1 truncate", current && "font-medium")}>{c.title}</span>
                <span className="text-muted-foreground tabular-nums">
                  {current && f > 0 ? `${pct(f)}% read` : `${readingMinutes(chapterWords(c))} min`}
                </span>
                {current ? (
                  <span className="hidden w-[84px] justify-end text-foreground sm:flex">
                    <span className="flex items-center gap-1 font-medium">
                      Resume <ArrowRightIcon className="size-3.5" />
                    </span>
                  </span>
                ) : (
                  <span className="hidden w-[84px] sm:block" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** The signature element: each chapter as a segment sized by its length, filled to where you are. */
function ChapterStrip({ activeId }: { activeId: string }) {
  const progress = useMyData().progress[book.id]
  const percent = pct(bookFraction(book, progress))
  return (
    <div className="mt-5">
      <div className="flex items-baseline gap-2">
        <span className="text-[32px] leading-none font-normal tracking-[-0.03em] tabular-nums">{percent}%</span>
        <span className="text-sm text-muted-foreground">read</span>
      </div>
      <div className="mt-3 flex gap-[3px]" role="img" aria-label={`${percent}% of ${book.title} read`}>
        {book.chapters.map((c) => {
          const f = chapterFraction(c, progress)
          return (
            <Tooltip key={c.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/read/${book.slug}/${c.id}`}
                  style={{ flexGrow: chapterWords(c) }}
                  className={cn("relative h-2 basis-0 overflow-hidden rounded-[2px] bg-muted transition-opacity hover:opacity-80", c.id === activeId && "ring-1 ring-foreground/25 ring-offset-1 ring-offset-card")}
                  aria-label={`Chapter ${c.number}: ${c.title}`}
                >
                  <span className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${f * 100}%` }} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                {c.number}. {c.title} · {f >= 1 ? "Finished" : f > 0 ? `${pct(f)}% read` : `${readingMinutes(chapterWords(c))} min`}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      <div className="mt-2 hidden justify-between text-xs text-muted-foreground sm:flex">
        <span>Introduction</span>
        <span>The Hand That Reached Down</span>
      </div>
    </div>
  )
}

// ── Coming up ─────────────────────────────────────────────────────

function ComingUp() {
  const data = useMyData()
  const toggle = useAppStore((s) => s.toggleNotifyBook)
  const live = useAppStore((s) => s.posts.find((p) => p.id === "p-live"))
  const next = books[1]
  const on = data.notifyBooks.includes(next.id)

  return (
    <section aria-labelledby="coming-heading" className="flex flex-col rounded-2xl bg-panel p-4 lg:col-span-3">
      <h2 id="coming-heading" className="px-1 text-sm font-semibold">
        Coming up
      </h2>
      <div className="mt-3 space-y-2">
        {live && (
          <Link href={`/community/announcements?post=${live.id}`} className="block rounded-xl border bg-card p-3.5 transition-colors hover:border-foreground/20">
            <div className="text-xs text-muted-foreground">Thu, Nov 20 · 7:00 PM CT</div>
            <div className="mt-1 text-sm leading-snug font-medium">Live Q&A with Bucky on Book 1</div>
            <div className="mt-1.5 text-xs text-muted-foreground">{live.replies.length} questions so far</div>
          </Link>
        )}
        <div className="rounded-xl border bg-card p-3.5">
          <div className="flex gap-3">
            <div className="w-10 shrink-0">
              <BookCover book={next} detail="mark" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Book 2 · {next.releaseDate && shortRelease(next.releaseDate)}</div>
              <div className="mt-1 text-sm leading-snug font-medium">{next.title}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              toggle(next.id)
              toast(on ? "Notifications off" : "We'll let you know", {
                description: on ? `You won't be notified about ${next.title}.` : `You'll hear from us when ${next.title} unlocks.`,
              })
            }}
          >
            {on ? <BellRingingIcon weight="fill" /> : <BellSimpleIcon />}
            {on ? "Notifying you" : "Notify me"}
          </Button>
        </div>
      </div>
      <Link href="/community/announcements" className="mt-auto flex items-center gap-1 px-1 pt-4 text-[13px] text-muted-foreground hover:text-foreground">
        All announcements <ArrowRightIcon className="size-3.5" />
      </Link>
    </section>
  )
}

// ── Community and highlights (6 + 6) ──────────────────────────────

function PanelHeader({ id, title, count, href, cta }: { id: string; title: string; count?: number; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 id={id} className="flex items-center gap-2 text-sm font-semibold">
        {title}
        {count !== undefined && <span className="rounded-[5px] bg-card px-1.5 text-xs font-normal text-muted-foreground tabular-nums">{count}</span>}
      </h2>
      <Link href={href} className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
        {cta} <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  )
}

function CommunityPanel() {
  const posts = useAppStore((s) => s.posts)
  const me = useMe()!
  const users = useUsersById()
  const latest = useMemo(
    () => [...posts].filter((p) => p.channelId !== "announcements").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [posts],
  )
  return (
    <section aria-labelledby="community-heading" className="rounded-2xl bg-panel p-4 lg:col-span-6">
      <PanelHeader id="community-heading" title="From the community" href="/community" cta="Open" />
      <div className="mt-3 space-y-2">
        {latest.map((p) => {
          const author = users[p.authorId]
          const channel = channels.find((c) => c.id === p.channelId)
          return (
            <Link key={p.id} href={`/community/${p.channelId}?post=${p.id}`} className="flex gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-foreground/20">
              <UserAvatar user={author} className="size-7" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px]">
                  <span className="truncate font-medium">{author?.displayName}</span>
                  {author && <RoleBadge role={author.role} />}
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline">in #{channel?.name}</span>
                  <span className="ml-auto flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground tabular-nums">
                    <span className="hidden items-center gap-1 sm:flex">
                      <HeartIcon weight={p.likes.includes(me.id) ? "fill" : "regular"} className={cn("size-3.5", p.likes.includes(me.id) && "text-rose-500")} />
                      {p.likes.length}
                    </span>
                    {timeAgo(p.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-foreground/85">{p.body}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground tabular-nums sm:hidden">
                  <span>#{channel?.name}</span>
                  <span className="flex items-center gap-1">
                    <HeartIcon weight={p.likes.includes(me.id) ? "fill" : "regular"} className={cn("size-3.5", p.likes.includes(me.id) && "text-rose-500")} />
                    {p.likes.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChatCircleIcon className="size-3.5" /> {p.replies.length}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function HighlightsPanel() {
  const data = useMyData()
  const recent = [...data.highlights].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
  return (
    <section aria-labelledby="highlights-heading" className="rounded-2xl bg-panel p-4 lg:col-span-6">
      <PanelHeader id="highlights-heading" title="Recent highlights" count={data.highlights.length} href="/notebook" cta="Notebook" />
      {recent.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed p-4 text-[13px] text-muted-foreground">
          Nothing highlighted yet. Select any sentence while reading to keep it here.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {recent.map((h) => {
            const ch = book.chapters.find((c) => c.id === h.chapterId)
            return (
              <Link
                key={h.id}
                href={`/read/${book.slug}/${h.chapterId}?p=${h.paragraph}`}
                className="flex gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-foreground/20"
              >
                <span className={cn("w-[3px] shrink-0 rounded-full", HL_SOLID[h.color])} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-serif text-[15px] leading-snug">{h.text}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">
                      {ch?.number}. {ch?.title}
                    </span>
                    {h.note && (
                      <>
                        <span>·</span>
                        <span className="flex shrink-0 items-center gap-1">
                          with a note
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
