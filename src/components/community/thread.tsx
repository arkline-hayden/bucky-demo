"use client"

import { PaperPlaneTiltIcon, TrashIcon, XIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { AutoTextarea, LikeButton, RichText, SendHint, Timestamp, UserHover } from "@/components/community/bits"
import { QuoteBlock } from "@/components/community/post-card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge, UserAvatar } from "@/components/user-avatar"
import { channels } from "@/lib/seed"
import { useAppStore, useMe, useUsersById } from "@/lib/store"
import type { Post } from "@/lib/types"

export function Thread({ post, onClose }: { post: Post; onClose: () => void }) {
  const me = useMe()!
  const users = useUsersById()
  const author = users[post.authorId]
  const togglePostLike = useAppStore((s) => s.togglePostLike)
  const toggleReplyLike = useAppStore((s) => s.toggleReplyLike)
  const addReply = useAppStore((s) => s.addReply)
  const deleteReply = useAppStore((s) => s.deleteReply)
  const [draft, setDraft] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const count = useRef(post.replies.length)
  const channel = channels.find((c) => c.id === post.channelId)

  useEffect(() => {
    if (post.replies.length > count.current) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    count.current = post.replies.length
  }, [post.replies.length])

  function send() {
    const body = draft.trim()
    if (!body) return
    addReply(post.id, body)
    setDraft("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="text-sm">
          <span className="font-semibold">Thread</span>
          <span className="ml-2 text-muted-foreground"># {channel?.name}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close thread">
              <XIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close</TooltipContent>
        </Tooltip>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b p-4">
          <div className="flex items-center gap-2.5">
            <UserHover user={author}>
              <button>
                <UserAvatar user={author} className="size-9" />
              </button>
            </UserHover>
            <div className="min-w-0 text-sm leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{author?.displayName}</span>
                {author && <RoleBadge role={author.role} />}
              </div>
              <Timestamp iso={post.createdAt} className="text-xs" />
            </div>
          </div>
          {post.title && <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.015em]">{post.title}</h3>}
          <RichText text={post.body} className="mt-2" />
          {post.quote && <QuoteBlock quote={post.quote} />}
          <div className="mt-2 -ml-2">
            <LikeButton liked={post.likes.includes(me.id)} count={post.likes.length} onToggle={() => togglePostLike(post.id)} />
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 pt-4 pb-1 text-xs text-muted-foreground">
          {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
          <span className="h-px flex-1 bg-border" />
        </div>

        <ul className="px-2 pb-4">
          <AnimatePresence initial={false}>
            {post.replies.map((r) => {
              const u = users[r.authorId]
              return (
                <motion.li
                  key={r.id}
                  layout="position"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex gap-2.5 rounded-lg px-2 py-2.5 hover:bg-muted/40"
                >
                  <UserHover user={u}>
                    <button className="h-fit">
                      <UserAvatar user={u} className="size-7" />
                    </button>
                  </UserHover>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <span className="font-semibold">{u?.displayName}</span>
                      {u && <RoleBadge role={u.role} />}
                      <Timestamp iso={r.createdAt} className="text-xs" />
                      {r.authorId === me.id && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                              onClick={() => {
                                deleteReply(post.id, r.id)
                                toast("Reply deleted")
                              }}
                              aria-label="Delete reply"
                            >
                              <TrashIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete reply</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <RichText text={r.body} className="mt-0.5 text-[14px]" />
                    <div className="mt-1 -ml-1.5">
                      <LikeButton size="sm" liked={r.likes.includes(me.id)} count={r.likes.length} onToggle={() => toggleReplyLike(post.id, r.id)} />
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </ul>
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="rounded-xl border bg-background px-3 pt-1.5 pb-2 shadow-xs transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
          <AutoTextarea value={draft} onChange={setDraft} onSubmit={send} placeholder={`Reply to ${author?.displayName.split(" ")[0] ?? "thread"}…`} />
          <div className="flex items-center justify-between">
            <SendHint />
            <Button size="sm" className="ml-auto" onClick={send} disabled={!draft.trim()}>
              <PaperPlaneTiltIcon weight="fill" /> Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
