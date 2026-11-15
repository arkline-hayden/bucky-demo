"use client"

import {
  BellSimpleIcon,
  BellSlashIcon,
  BookOpenTextIcon,
  HashIcon,
  LockSimpleIcon,
  MegaphoneIcon,
  PaperPlaneTiltIcon,
  PushPinIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { AutoTextarea, SendHint } from "@/components/community/bits"
import { PostCard } from "@/components/community/post-card"
import { Thread } from "@/components/community/thread"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { useIsMobile, useMediaQuery } from "@/hooks/use-mobile"
import { shortRelease } from "@/lib/format"
import { channels } from "@/lib/seed"
import { books } from "@/lib/books"
import { useAppStore, useMe } from "@/lib/store"
import type { Channel } from "@/lib/types"
import { cn } from "@/lib/utils"

function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  if (channel.kind === "announcements") return <MegaphoneIcon className={className} />
  if (channel.bookId) return <BookOpenTextIcon className={className} />
  return <HashIcon className={className} />
}

function initialThread() {
  if (typeof window === "undefined") return null
  const id = new URLSearchParams(window.location.search).get("post")
  return id && useAppStore.getState().posts.some((p) => p.id === id) ? id : null
}

export function CommunityView({ channelId }: { channelId: string }) {
  const channel = channels.find((c) => c.id === channelId) ?? channels[1]
  const posts = useAppStore((s) => s.posts)
  const isXl = useMediaQuery("(min-width: 1280px)")
  // Deep links: /community/general?post=p-g1 (this view is keyed per channel)
  const [threadId, setThreadId] = useState<string | null>(initialThread)

  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.channelId === channel.id)
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt.localeCompare(a.createdAt)),
    [posts, channel.id],
  )
  const thread = threadId ? posts.find((p) => p.id === threadId) : undefined

  const openThread = useCallback((id: string | null) => {
    setThreadId(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("post", id)
    else url.searchParams.delete("post")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  return (
    <div className="flex md:h-[calc(100dvh-3rem)]">
      <ChannelRail active={channel.id} />

      <div className="min-w-0 flex-1 md:overflow-y-auto" id="feed-scroll">
        <ChannelHeader channel={channel} />
        <MobileChannelChips active={channel.id} />
        <div className="mx-auto w-full max-w-3xl px-2 pb-10 sm:px-4">
          {channel.id === "general" && <PinnedWelcome />}
          <Composer channel={channel} />
          {feed.length === 0 ? (
            <EmptyChannel channel={channel} />
          ) : (
            <div className="mt-2 space-y-0.5">
              <AnimatePresence initial={false}>
                {feed.map((p) => (
                  <PostCard key={p.id} post={p} selected={p.id === threadId} onOpen={() => openThread(p.id)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Thread: docked on wide screens, a sheet otherwise */}
      <AnimatePresence>
        {isXl && thread && (
          <motion.aside
            key="thread"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 overflow-hidden border-l bg-background"
          >
            <div className="h-full w-[400px]">
              <Thread post={thread} onClose={() => openThread(null)} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <Sheet open={!isXl && !!thread} onOpenChange={(o) => !o && openThread(null)}>
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>Thread</SheetTitle>
            <SheetDescription>Replies to this post</SheetDescription>
          </SheetHeader>
          {thread && <Thread post={thread} onClose={() => openThread(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ChannelRail({ active }: { active: string }) {
  const posts = useAppStore((s) => s.posts)
  const groups = ["Community", "Books"] as const
  return (
    <nav aria-label="Channels" className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r bg-background p-3 lg:flex">
      <div className="px-2 pt-1 pb-3">
        <div className="text-[15px] font-semibold tracking-[-0.01em]">Renewed Community</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> 38 online · 1,284 members
        </div>
      </div>
      {groups.map((g) => (
        <div key={g} className="mt-3">
          <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">{g}</div>
          {channels
            .filter((c) => c.group === g)
            .map((c) => {
              const count = posts.filter((p) => p.channelId === c.id).length
              const locked = c.bookId && books.find((b) => b.id === c.bookId)?.status !== "available"
              const isActive = c.id === active
              return (
                <Link
                  key={c.id}
                  href={`/community/${c.id}`}
                  className={cn(
                    "relative flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                    isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <ChannelIcon channel={c} className="size-4 shrink-0 opacity-70" />
                  <span className="truncate">{c.name}</span>
                  {locked ? (
                    <LockSimpleIcon className="ml-auto size-3 text-muted-foreground" />
                  ) : (
                    count > 0 && <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
                  )}
                </Link>
              )
            })}
        </div>
      ))}
    </nav>
  )
}

function MobileChannelChips({ active }: { active: string }) {
  return (
    <div className="sticky top-12 z-20 -mt-px border-b bg-background md:top-[57px] lg:hidden">
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4">
        {channels.map((c) => (
          <Link
            key={c.id}
            href={`/community/${c.id}`}
            className={cn(
              "flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[13px] transition-colors",
              c.id === active ? "border-transparent bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ChannelIcon channel={c} className="size-3.5" />
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function ChannelHeader({ channel }: { channel: Channel }) {
  const [muted, setMuted] = useState(false)
  return (
    <div className="z-20 border-b bg-background md:sticky md:top-0">
      <div className="flex min-h-14 items-center gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-panel">
          <ChannelIcon channel={channel} className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold">{channel.name}</h1>
          <p className="truncate text-[13px] text-muted-foreground">{channel.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <Members />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setMuted((m) => !m)
                  toast(muted ? `Notifications on for #${channel.name}` : `#${channel.name} muted`)
                }}
                aria-label={muted ? "Unmute channel" : "Mute channel"}
              >
                {muted ? <BellSlashIcon /> : <BellSimpleIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{muted ? "Unmute channel" : "Mute channel"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

function Members() {
  const users = useAppStore((s) => s.users)
  const online = new Set(["u-bucky", "u-grace", "u-marcus", "u-sam", "u-kayla", "u-nate", "u-chris"])
  const isMobile = useIsMobile()
  const groups: { label: string; filter: (r: string) => boolean }[] = [
    { label: "Team", filter: (r) => r === "author" || r === "admin" },
    { label: "Moderators", filter: (r) => r === "moderator" },
    { label: "Members", filter: (r) => r === "member" },
  ]
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <div className="hidden -space-x-1.5 sm:flex">
                {users.slice(1, 4).map((u) => (
                  <UserAvatar key={u.id} user={u} size="sm" className="size-5 ring-2 ring-background" />
                ))}
              </div>
              <UsersThreeIcon className="sm:hidden" />
              <span className="tabular-nums">1,284</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Members</TooltipContent>
      </Tooltip>
      <PopoverContent align={isMobile ? "center" : "end"} className="w-72 p-0">
        <div className="border-b px-4 py-3 text-sm font-medium">Members</div>
        <div className="max-h-80 overflow-y-auto p-2">
          {groups.map((g) => (
            <div key={g.label} className="mb-2">
              <div className="px-2 py-1 text-xs text-muted-foreground">{g.label}</div>
              {users
                .filter((u) => g.filter(u.role))
                .map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <div className="relative">
                      <UserAvatar user={u} size="sm" className="size-7" />
                      {online.has(u.id) && <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-popover bg-emerald-500" />}
                    </div>
                    <span className="truncate text-sm">{u.displayName}</span>
                    <RoleBadge role={u.role} className="ml-auto" />
                  </div>
                ))}
            </div>
          ))}
          <div className="px-2 pb-1 text-xs text-muted-foreground">and 1,268 more</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PinnedWelcome() {
  const post = useAppStore((s) => s.posts.find((p) => p.pinned))
  if (!post) return null
  return (
    <Link
      href={`/community/announcements?post=${post.id}`}
      className="mt-4 flex items-center gap-3 rounded-xl bg-panel px-4 py-3 text-sm transition-colors hover:bg-muted"
    >
      <PushPinIcon weight="fill" className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{post.title}</span>
        <span className="text-muted-foreground"> · pinned in #announcements</span>
      </span>
    </Link>
  )
}

function Composer({ channel }: { channel: Channel }) {
  const me = useMe()!
  const createPost = useAppStore((s) => s.createPost)
  const [draft, setDraft] = useState("")
  const [focused, setFocused] = useState(false)
  const book = channel.bookId ? books.find((b) => b.id === channel.bookId) : undefined

  if (book && book.status !== "available") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm text-muted-foreground">
        <LockSimpleIcon className="size-4 shrink-0" />
        This channel opens when {book.title} releases on {book.releaseDate && shortRelease(book.releaseDate)}.
      </div>
    )
  }
  if (channel.kind === "announcements" && me.role !== "admin" && me.role !== "author") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm text-muted-foreground">
        <MegaphoneIcon className="size-4 shrink-0" />
        Only Bucky and the Renewed team can post announcements. Reply to join the conversation.
      </div>
    )
  }

  function submit() {
    const body = draft.trim()
    if (!body) return
    createPost({ channelId: channel.id, body })
    setDraft("")
    document.getElementById("feed-scroll")?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const placeholder = channel.id === "prayer-requests" ? "What can we pray with you about?" : channel.id === "testimonies" ? "Share what God is doing…" : `Message #${channel.name}`

  return (
    <div
      className={cn(
        "mt-4 flex gap-3 rounded-2xl border bg-card px-3 pt-3 pb-2.5 transition-shadow sm:px-4",
        focused && "border-ring ring-3 ring-ring/30",
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <UserAvatar user={me} className="mt-0.5 size-8" />
      <div className="min-w-0 flex-1">
        <AutoTextarea value={draft} onChange={setDraft} onSubmit={submit} placeholder={placeholder} minRows={draft || focused ? 2 : 1} />
        <div className="mt-1 flex items-center justify-end gap-3">
          <SendHint />
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            <PaperPlaneTiltIcon weight="fill" /> Post
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptyChannel({ channel }: { channel: Channel }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
        <ChannelIcon channel={channel} className="size-6 text-muted-foreground" />
      </div>
      <div className="mt-4 font-medium">No posts in #{channel.name} yet</div>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{channel.description}</p>
    </div>
  )
}
