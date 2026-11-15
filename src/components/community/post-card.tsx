"use client"

import {
  ArrowSquareOutIcon,
  ChatCircleIcon,
  CopyIcon,
  DotsThreeIcon,
  FlagIcon,
  LinkSimpleIcon,
  PushPinIcon,
  QuotesIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { LikeButton, RichText, Timestamp, UserHover } from "@/components/community/bits"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { getBook } from "@/lib/books"
import { useAppStore, useMe, useUsersById } from "@/lib/store"
import type { Post } from "@/lib/types"
import { cn } from "@/lib/utils"

export function postLink(post: Post) {
  const base = typeof window !== "undefined" ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : ""
  return `${base}/community/${post.channelId}/?post=${post.id}`
}

export function QuoteBlock({ quote, compact }: { quote: NonNullable<Post["quote"]>; compact?: boolean }) {
  const book = getBook(quote.bookId)
  const chapter = book?.chapters.find((c) => c.id === quote.chapterId)
  if (!book || !chapter) return null
  return (
    <Link
      href={`/read/${book.slug}/${chapter.id}?p=${quote.paragraph}`}
      onClick={(e) => e.stopPropagation()}
      className="group/q mt-3 block rounded-xl bg-panel px-4 py-3 transition-colors hover:bg-muted"
    >
      <QuotesIcon weight="fill" className="mb-1 size-4 text-muted-foreground" />
      <blockquote className={cn("font-serif text-[16px] leading-snug", compact && "line-clamp-3")}>{quote.text}</blockquote>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        {book.title} · {chapter.title}
        <ArrowSquareOutIcon className="size-3 opacity-0 transition-opacity group-hover/q:opacity-100" />
      </div>
    </Link>
  )
}

export function PostCard({ post, onOpen, selected }: { post: Post; onOpen: () => void; selected?: boolean }) {
  const me = useMe()!
  const users = useUsersById()
  const author = users[post.authorId]
  const toggleLike = useAppStore((s) => s.togglePostLike)
  const deletePost = useAppStore((s) => s.deletePost)
  const [confirm, setConfirm] = useState(false)
  const isMine = post.authorId === me.id
  const repliers = [...new Set(post.replies.map((r) => r.authorId))].slice(-3)

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex gap-3 rounded-xl px-3 py-4 transition-colors sm:px-4",
        selected ? "bg-muted/70" : "hover:bg-muted/40",
      )}
    >
      <UserHover user={author}>
        <button className="h-fit shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <UserAvatar user={author} className="size-9" />
        </button>
      </UserHover>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm">
          <UserHover user={author}>
            <button className="truncate font-semibold hover:underline">{author?.displayName}</button>
          </UserHover>
          {author && <RoleBadge role={author.role} />}
          <span className="hidden truncate text-muted-foreground sm:inline">@{author?.username}</span>
          <span className="text-muted-foreground">·</span>
          <Timestamp iso={post.createdAt} className="shrink-0 text-[13px]" />
          {post.pinned && (
            <Tooltip>
              <TooltipTrigger asChild>
                <PushPinIcon weight="fill" className="size-3.5 shrink-0 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Pinned</TooltipContent>
            </Tooltip>
          )}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground opacity-100 transition-opacity data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label="More">
                  <DotsThreeIcon weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard?.writeText(postLink(post))
                    toast("Link copied")
                  }}
                >
                  <LinkSimpleIcon /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard?.writeText(post.body)
                    toast("Text copied")
                  }}
                >
                  <CopyIcon /> Copy text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isMine ? (
                  <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
                    <TrashIcon /> Delete post
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => toast("Thanks for letting us know", { description: "A moderator will review this post." })}>
                    <FlagIcon /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {post.title && <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.015em]">{post.title}</h3>}
        <RichText text={post.body} className={cn("mt-1 text-foreground/90", post.title && "mt-1.5")} />
        {post.quote && <QuoteBlock quote={post.quote} compact />}

        <div className="mt-2.5 -ml-2 flex items-center gap-1">
          <LikeButton liked={post.likes.includes(me.id)} count={post.likes.length} onToggle={() => toggleLike(post.id)} />
          {post.replies.length === 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpen}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] text-muted-foreground tabular-nums transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChatCircleIcon className="size-4" /> Reply
              </button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          )}
          {post.replies.length > 0 && (
            <button onClick={onOpen} className="ml-1 flex items-center gap-2 rounded-full py-0.5 pr-2 pl-0.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <AvatarGroup className="*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
                {repliers.map((id) => (
                  <UserAvatar key={id} user={users[id]} size="sm" className="size-5" />
                ))}
              </AvatarGroup>
              <span className="font-medium">
                {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
              </span>
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This removes your post and its replies for everyone. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deletePost(post.id)
                toast("Post deleted")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.article>
  )
}
