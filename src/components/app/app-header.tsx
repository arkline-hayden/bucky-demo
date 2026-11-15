"use client"

import { BellIcon, CaretRightIcon, ChatCircleIcon, HeartIcon, MagnifyingGlassIcon, MegaphoneIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useMemo, useState } from "react"
import { useCommandMenu } from "@/components/app/command-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { UserAvatar } from "@/components/user-avatar"
import { getBook } from "@/lib/books"
import { timeAgo } from "@/lib/format"
import { channels } from "@/lib/seed"
import { useAppStore, useMe, useUsersById } from "@/lib/store"
import { cn } from "@/lib/utils"

function useCrumbs(): { label: string; href?: string }[] {
  const pathname = usePathname().replace(/\/$/, "")
  const [, section, id] = pathname.split("/")
  switch (section) {
    case "home":
      return [{ label: "Home" }]
    case "library": {
      const book = id ? getBook(id) : undefined
      return book ? [{ label: "Library", href: "/library" }, { label: book.title }] : [{ label: "Library" }]
    }
    case "community": {
      const ch = channels.find((c) => c.id === (id ?? "general"))
      return [{ label: "Community", href: "/community" }, { label: `# ${ch?.name ?? "general"}` }]
    }
    case "notebook":
      return [{ label: "Notebook" }]
    case "settings":
      return [{ label: "Settings" }]
    case "profile":
      return [{ label: "Profile" }]
    default:
      return []
  }
}

export function AppHeader() {
  const crumbs = useCrumbs()
  const openSearch = useCommandMenu((s) => s.setOpen)
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="-ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          Toggle sidebar <Kbd className="ml-1">⌘B</Kbd>
        </TooltipContent>
      </Tooltip>
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <CaretRightIcon className="size-3 shrink-0 text-muted-foreground/60" />}
            {c.href ? (
              <Link href={c.href} className="truncate rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="truncate px-1 font-medium">{c.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openSearch(true)} aria-label="Search" className="md:hidden">
              <MagnifyingGlassIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
        <Notifications />
        <ThemeToggle />
      </div>
    </header>
  )
}

function Notifications() {
  const me = useMe()
  const posts = useAppStore((s) => s.posts)
  const users = useUsersById()
  const router = useRouter()
  const [readAt, setReadAt] = useState<number>(0)

  const items = useMemo(() => {
    if (!me) return []
    const list: { id: string; icon: typeof BellIcon; actorId: string; text: string; at: string; href: string }[] = []
    for (const p of posts) {
      if (p.authorId === me.id) {
        for (const r of p.replies) {
          if (r.authorId !== me.id) list.push({ id: r.id, icon: ChatCircleIcon, actorId: r.authorId, text: "replied to your post", at: r.createdAt, href: `/community/${p.channelId}?post=${p.id}` })
        }
        const likers = p.likes.filter((l) => l !== me.id)
        if (likers.length) list.push({ id: `${p.id}-likes`, icon: HeartIcon, actorId: likers[0], text: likers.length > 1 ? `and ${likers.length - 1} others liked your post` : "liked your post", at: p.createdAt, href: `/community/${p.channelId}?post=${p.id}` })
      }
      for (const r of p.replies) {
        if (r.authorId === me.id) {
          const likers = r.likes.filter((l) => l !== me.id)
          if (likers.length) list.push({ id: `${r.id}-likes`, icon: HeartIcon, actorId: likers[0], text: likers.length > 1 ? `and ${likers.length - 1} others liked your reply` : "liked your reply", at: r.createdAt, href: `/community/${p.channelId}?post=${p.id}` })
        }
      }
      if (p.channelId === "announcements" && p.authorId !== me.id) {
        list.push({ id: p.id, icon: MegaphoneIcon, actorId: p.authorId, text: `posted “${p.title ?? "an announcement"}”`, at: p.createdAt, href: `/community/announcements?post=${p.id}` })
      }
    }
    return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)
  }, [posts, me])

  const unread = items.filter((i, idx) => idx < 3 && new Date(i.at).getTime() > readAt).length

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <BellIcon className="size-4" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-foreground ring-2 ring-background" />}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-[min(360px,calc(100vw-24px))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-medium">Notifications</div>
          <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setReadAt(Date.now())} disabled={!unread}>
            Mark all as read
          </Button>
        </div>
        <ul className="max-h-[380px] overflow-y-auto py-1">
          {items.map((n, i) => {
            const actor = users[n.actorId]
            const isUnread = i < 3 && new Date(n.at).getTime() > readAt
            return (
              <li key={n.id}>
                <button
                  onClick={() => router.push(n.href)}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="relative">
                    <UserAvatar user={actor} />
                    <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 border-popover bg-muted">
                      <n.icon weight="fill" className="size-2.5 text-muted-foreground" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-[13px] leading-snug">
                    <span className="font-medium">{actor?.displayName}</span> <span className="text-muted-foreground">{n.text}</span>
                    <div className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.at)}</div>
                  </div>
                  <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", isUnread ? "bg-foreground" : "bg-transparent")} />
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
