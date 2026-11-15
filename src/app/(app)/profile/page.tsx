"use client"

import { CalendarBlankIcon, ChatCircleIcon, HeartIcon, MapPinIcon, PencilSimpleIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"
import { BookCover } from "@/components/book-cover"
import { CountUp, FadeIn } from "@/components/motion"
import { Page } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { books } from "@/lib/books"
import { timeAgo } from "@/lib/format"
import { bookFraction, completedChapters, currentStreak, pct } from "@/lib/progress"
import { channels } from "@/lib/seed"
import { useAppStore, useMe, useMyData } from "@/lib/store"

export default function ProfilePage() {
  const me = useMe()!
  const data = useMyData()
  const posts = useAppStore((s) => s.posts)
  const book = books[0]
  const progress = data.progress[book.id]

  const activity = useMemo(() => {
    const items: { id: string; kind: "post" | "reply"; body: string; at: string; channelId: string; postId: string; likes: number }[] = []
    for (const p of posts) {
      if (p.authorId === me.id) items.push({ id: p.id, kind: "post", body: p.body, at: p.createdAt, channelId: p.channelId, postId: p.id, likes: p.likes.length })
      for (const r of p.replies) if (r.authorId === me.id) items.push({ id: r.id, kind: "reply", body: r.body, at: r.createdAt, channelId: p.channelId, postId: p.id, likes: r.likes.length })
    }
    return items.sort((a, b) => b.at.localeCompare(a.at))
  }, [posts, me.id])

  const likesReceived = activity.reduce((n, a) => n + a.likes, 0)
  const minutes = Object.values(data.readingLog).reduce((n, m) => n + m, 0)

  const stats = [
    { label: "Chapters read", value: completedChapters(book, progress) },
    { label: "Day streak", value: currentStreak(data.readingLog) },
    { label: "Minutes read", value: minutes },
    { label: "Highlights", value: data.highlights.length },
    { label: "Likes received", value: likesReceived },
  ]

  return (
    <Page>
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-panel">
          <div className="h-24 bg-[#13213a] sm:h-32" />
          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex items-end justify-between gap-4">
              <UserAvatar user={me} size="lg" className="size-24 ring-4 ring-panel" />
              <Button asChild variant="outline" size="sm">
                <Link href="/settings">
                  <PencilSimpleIcon /> Edit profile
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-[26px] font-medium tracking-[-0.025em]">{me.displayName}</h1>
              <RoleBadge role={me.role} />
            </div>
            <div className="text-[15px] text-muted-foreground">@{me.username}</div>
            {me.bio && <p className="mt-3 max-w-xl text-[15px] leading-relaxed">{me.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {me.location && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" /> {me.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarBlankIcon className="size-4" /> Joined {format(new Date(me.joinedAt), "MMMM yyyy")}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-background bg-background sm:grid-cols-5">
            {stats.map((s, i) => (
              <div key={s.label} className={`bg-panel px-5 py-4 sm:px-6 ${i === stats.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
                <CountUp value={s.value} className="text-2xl font-normal tracking-[-0.02em] tabular-nums" />
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_260px]">
        <FadeIn delay={0.1}>
          <h2 className="mb-3 text-[15px] font-semibold">Activity</h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Your posts and replies will show up here. <Link href="/community" className="text-foreground underline underline-offset-4">Say hello</Link>
            </div>
          ) : (
            <div className="divide-y divide-background rounded-2xl bg-panel">
              {activity.map((a) => (
                <Link key={a.id} href={`/community/${a.channelId}?post=${a.postId}`} className="block p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {a.kind === "post" ? "Posted" : "Replied"} in #{channels.find((c) => c.id === a.channelId)?.name} · {timeAgo(a.at)}
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed">{a.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="size-3.5" /> {a.likes}
                    </span>
                    {a.kind === "post" && (
                      <span className="flex items-center gap-1">
                        <ChatCircleIcon className="size-3.5" /> {posts.find((p) => p.id === a.postId)?.replies.length ?? 0}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </FadeIn>
        <FadeIn delay={0.15}>
          <h2 className="mb-3 text-[15px] font-semibold">Bookshelf</h2>
          <div className="space-y-3">
            {books.slice(0, 3).map((b) => {
              const f = pct(bookFraction(b, data.progress[b.id]))
              return (
                <Link key={b.id} href={`/library/${b.slug}`} className="flex items-center gap-3 rounded-2xl bg-panel p-3 transition-colors hover:bg-muted">
                  <div className="w-10 shrink-0">
                    <BookCover book={b} detail="mark" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{b.title}</div>
                    {b.status === "available" ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={f} className="h-1 flex-1" indicatorClassName="bg-brand" />
                        <span className="text-xs text-muted-foreground tabular-nums">{f}%</span>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </FadeIn>
      </div>
    </Page>
  )
}
