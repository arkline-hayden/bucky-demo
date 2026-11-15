"use client"

import {
  BellRingingIcon,
  BellSimpleIcon,
  BookOpenTextIcon,
  ChatsCircleIcon,
  ClockIcon,
  HighlighterIcon,
  ListNumbersIcon,
  LockSimpleIcon,
  NotePencilIcon,
  PlayIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { toast } from "sonner"
import { BookCover } from "@/components/book-cover"
import { Page } from "@/components/page-header"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { ProgressRing } from "@/components/progress-ring"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { books, bookWords, chapterWords, getBook, readingMinutes } from "@/lib/books"
import { friendlyDay, releaseDate } from "@/lib/format"
import { HL_SOLID } from "@/lib/highlight"
import { bookFraction, chapterFraction, completedChapters, pct, resumeTarget } from "@/lib/progress"
import { useAppStore, useMyData } from "@/lib/store"
import { cn } from "@/lib/utils"

export function BookDetail({ slug }: { slug: string }) {
  const book = getBook(slug)!
  const data = useMyData()
  const toggleNotify = useAppStore((s) => s.toggleNotifyBook)
  const progress = data.progress[book.id]
  const available = book.status === "available"
  const percent = pct(bookFraction(book, progress))
  const resume = resumeTarget(book, progress)
  const words = bookWords(book)
  const highlights = data.highlights.filter((h) => h.bookId === book.id)
  const notify = data.notifyBooks.includes(book.id)

  return (
    <Page>
      <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
        {/* Cover column */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="mx-auto w-44 sm:w-52 md:w-full">
            <BookCover book={book} />
          </div>
          {available && progress && (
            <FadeIn delay={0.2} className="mt-6 hidden rounded-2xl bg-panel p-4 md:block">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{percent}% complete</span>
                <span className="text-muted-foreground">
                  {completedChapters(book, progress)}/{book.chapters.length} chapters
                </span>
              </div>
              <Progress value={percent} className="mt-2.5 h-1.5" indicatorClassName="bg-brand" />
              <div className="mt-3 text-xs text-muted-foreground">Last read {friendlyDay(progress.lastReadAt)}</div>
            </FadeIn>
          )}
        </div>

        {/* Details column */}
        <div className="min-w-0">
          <FadeIn>
            <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-balance sm:text-[32px]">{book.title}</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">
              Book {book.number} of 7 in Renewed{available ? "" : ` · releases ${book.releaseDate && releaseDate(book.releaseDate)}`}
            </p>
            <p className="mt-5 text-lg leading-snug tracking-[-0.01em]">{book.tagline}</p>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/85">{book.description}</p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground tabular-nums empty:hidden">
              {available ? (
                <>
                  <Meta icon={ListNumbersIcon}>{book.chapters.length} chapters</Meta>
                  <Meta icon={ClockIcon}>{readingMinutes(words)} min read</Meta>
                  <Meta icon={BookOpenTextIcon}>{words.toLocaleString()} words</Meta>
                  <Meta icon={NotePencilIcon}>{book.chapters.reduce((n, c) => n + c.reflections.length, 0)} reflection questions</Meta>
                </>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {available ? (
                <>
                  <Button asChild size="lg" className="h-10 px-4">
                    <Link href={`/read/${book.slug}/${resume.chapter.id}`}>
                      <PlayIcon weight="fill" />
                      {percent > 0 ? `Continue · Chapter ${resume.chapter.number}` : "Start reading"}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-10 px-4">
                    <Link href="/community/the-highest-power">
                      <ChatsCircleIcon /> Discussion
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  variant={notify ? "secondary" : "default"}
                  className="h-10 px-4"
                  onClick={() => {
                    toggleNotify(book.id)
                    toast(notify ? "Notifications off" : "You're on the list", {
                      description: notify ? undefined : `We'll notify you the moment ${book.title} unlocks.`,
                    })
                  }}
                >
                  {notify ? <BellRingingIcon weight="fill" /> : <BellSimpleIcon />}
                  {notify ? "Notifying you at launch" : "Notify me at launch"}
                </Button>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-10">
            {available ? (
              <Tabs defaultValue="chapters">
                <TabsList variant="line" className="w-full justify-start gap-4 border-b px-0">
                  <TabsTrigger value="chapters" className="flex-none px-0">Chapters</TabsTrigger>
                  <TabsTrigger value="highlights" className="flex-none px-0">
                    Your highlights <span className="ml-1 text-muted-foreground tabular-nums">{highlights.length}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chapters" className="mt-2">
                  <Stagger gap={0.03}>
                    {book.chapters.map((c) => {
                      const f = chapterFraction(c, progress)
                      const isCurrent = c.id === resume.chapter.id && percent > 0 && f < 1
                      const answered = c.reflections.filter((q) => data.reflections[q.id]).length
                      const notes = highlights.filter((h) => h.chapterId === c.id).length
                      return (
                        <StaggerItem key={c.id}>
                          <Link
                            href={`/read/${book.slug}/${c.id}`}
                            className={cn(
                              "group -mx-3 flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-muted/60",
                              isCurrent && "bg-muted/70",
                            )}
                          >
                            <span className="w-6 text-right text-sm text-muted-foreground tabular-nums">{c.number}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[15px] font-medium">{c.title}</span>
                                {isCurrent && <span className="shrink-0 text-xs text-muted-foreground">You are here</span>}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                <span>{readingMinutes(chapterWords(c))} min</span>
                                {notes > 0 && (
                                  <span className="flex items-center gap-1">
                                    <HighlighterIcon className="size-3" /> {notes}
                                  </span>
                                )}
                                {answered > 0 && (
                                  <span className="flex items-center gap-1">
                                    <NotePencilIcon className="size-3" /> {answered}/{c.reflections.length} reflections
                                  </span>
                                )}
                              </div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <ProgressRing value={f} size={22} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{f >= 1 ? "Completed" : f > 0 ? `${pct(f)}% read` : "Not started"}</TooltipContent>
                            </Tooltip>
                          </Link>
                        </StaggerItem>
                      )
                    })}
                  </Stagger>
                </TabsContent>
                <TabsContent value="highlights" className="mt-4">
                  {highlights.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">Select text while reading to create your first highlight.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {highlights.map((h) => {
                        const c = book.chapters.find((x) => x.id === h.chapterId)
                        return (
                          <Link key={h.id} href={`/read/${book.slug}/${h.chapterId}?p=${h.paragraph}`} className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
                            <div className="flex gap-3">
                              <span className={cn("w-[3px] shrink-0 rounded-full", HL_SOLID[h.color])} />
                              <div className="min-w-0">
                                <p className="font-serif text-[15px] leading-snug">“{h.text}”</p>
                                {h.note && <p className="mt-2 text-[13px] text-muted-foreground">{h.note}</p>}
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Ch. {c?.number} · {c?.title}
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div>
                <h2 className="border-b pb-3 text-sm font-medium">Chapters</h2>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
                  <LockSimpleIcon className="size-4 shrink-0" />
                  The chapters are revealed when {book.title} releases. Turn on notifications and we&apos;ll tell you that day.
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </div>

      <section aria-labelledby="series-heading" className="mt-16">
        <h2 id="series-heading" className="text-base font-medium">The series</h2>
        <p className="mt-1 text-sm text-muted-foreground">Seven steps, meant to be read in order.</p>
        <ol className="mt-5 grid grid-cols-4 gap-x-4 gap-y-6 sm:grid-cols-7">
          {books.map((b) => {
            const current = b.id === book.id
            return (
              <li key={b.id}>
                <Link href={`/library/${b.slug}`} aria-current={current ? "page" : undefined} className="group block">
                  <div className={cn("rounded-[7px] p-[3px] transition-colors", current ? "bg-foreground/80" : "group-hover:bg-muted")}>
                    <BookCover book={b} detail="mark" />
                  </div>
                  <div className={cn("mt-2 truncate text-[13px]", current ? "font-medium" : "text-muted-foreground group-hover:text-foreground")}>{b.title}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {b.status === "available" ? `${pct(bookFraction(b, data.progress[b.id]))}% read` : b.releaseDate && releaseDate(b.releaseDate).replace(/, d{4}$/, "")}
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>
    </Page>
  )
}

function Meta({ icon: Icon, children }: { icon: typeof ClockIcon; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-4" />
      {children}
    </span>
  )
}
