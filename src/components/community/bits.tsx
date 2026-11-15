"use client"

import { CalendarBlankIcon, HeartIcon, MapPinIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { AnimatePresence, motion } from "motion/react"
import { Fragment, useEffect, useRef } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Kbd } from "@/components/ui/kbd"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { fullDate, timeAgo } from "@/lib/format"
import { useAppStore } from "@/lib/store"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

export function UserHover({ user, children }: { user?: User; children: React.ReactNode }) {
  if (!user) return <>{children}</>
  return (
    <HoverCard openDelay={350} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-72">
        <div className="flex items-start justify-between">
          <UserAvatar user={user} size="lg" className="size-12" />
          <RoleBadge role={user.role} />
        </div>
        <div className="mt-3 text-[15px] font-semibold">{user.displayName}</div>
        <div className="text-[13px] text-muted-foreground">@{user.username}</div>
        {user.bio && <p className="mt-2 text-[13px] leading-relaxed">{user.bio}</p>}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {user.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarBlankIcon className="size-3.5" />
            Joined {format(new Date(user.joinedAt), "MMMM yyyy")}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function Timestamp({ iso, className }: { iso: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={iso} className={cn("cursor-default text-muted-foreground", className)}>
          {timeAgo(iso)}
        </time>
      </TooltipTrigger>
      <TooltipContent>{fullDate(iso)}</TooltipContent>
    </Tooltip>
  )
}

/** Renders text with @mentions emphasized. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const users = useAppStore((s) => s.users)
  const parts = text.split(/(@[a-z0-9._]+)/gi)
  return (
    <div className={cn("text-[15px] leading-relaxed break-words whitespace-pre-line", className)}>
      {parts.map((p, i) => {
        if (p.startsWith("@") && users.some((u) => u.username === p.slice(1).toLowerCase())) {
          return (
            <span key={i} className="font-medium text-foreground">
              {p}
            </span>
          )
        }
        return <Fragment key={i}>{p}</Fragment>
      })}
    </div>
  )
}

export function LikeButton({ liked, count, onToggle, size = "default" }: { liked: boolean; count: number; onToggle: () => void; size?: "default" | "sm" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={cn(
            "group/like inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] tabular-nums transition-colors",
            liked ? "text-rose-500" : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500",
            size === "sm" && "px-1.5 py-0.5 text-xs",
          )}
        >
          <motion.span key={String(liked)} initial={liked ? { scale: 0.4 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className="inline-flex">
            <HeartIcon weight={liked ? "fill" : "regular"} className={size === "sm" ? "size-3.5" : "size-4"} />
          </motion.span>
          <span className="relative inline-flex overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={count} initial={{ y: liked ? 10 : -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: liked ? -10 : 10, opacity: 0 }} transition={{ duration: 0.18 }}>
                {count > 0 ? count : ""}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{liked ? "Unlike" : "Like"}</TooltipContent>
    </Tooltip>
  )
}

export function AutoTextarea({
  value,
  onChange,
  onSubmit,
  placeholder,
  autoFocus,
  minRows = 1,
  className,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder: string
  autoFocus?: boolean
  minRows?: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <Textarea
      ref={ref}
      rows={minRows}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          onSubmit()
        }
      }}
      placeholder={placeholder}
      className={cn("max-h-64 min-h-0 resize-none border-none bg-transparent px-0 py-1.5 text-[15px] shadow-none focus-visible:ring-0 dark:bg-transparent", className)}
    />
  )
}

export function SendHint() {
  return (
    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
      <Kbd>⌘</Kbd>
      <Kbd>↵</Kbd> to send
    </span>
  )
}
