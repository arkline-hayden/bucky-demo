"use client"

import { PaperPlaneTiltIcon, QuotesIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { channels } from "@/lib/seed"
import { useAppStore, useMe } from "@/lib/store"
import type { Post } from "@/lib/types"

export type ShareQuote = NonNullable<Post["quote"]> & { chapterTitle: string }

export function ShareDialog({ quote, onOpenChange }: { quote: ShareQuote | null; onOpenChange: (open: boolean) => void }) {
  const me = useMe()
  const createPost = useAppStore((s) => s.createPost)
  const router = useRouter()
  const [body, setBody] = useState("")
  const [channelId, setChannelId] = useState("the-highest-power")
  const postable = channels.filter((c) => c.kind === "discussion" && c.id !== "the-first-repentance")

  function submit() {
    if (!quote) return
    const q = { text: quote.text, bookId: quote.bookId, chapterId: quote.chapterId, paragraph: quote.paragraph }
    const id = createPost({ channelId, body: body.trim() || "This stood out to me today.", quote: q })
    onOpenChange(false)
    setBody("")
    toast.success("Shared with the community", {
      action: { label: "View", onClick: () => router.push(`/community/${channelId}?post=${id}`) },
    })
  }

  return (
    <Dialog open={!!quote} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share to community</DialogTitle>
          <DialogDescription>Post this passage with your thoughts.</DialogDescription>
        </DialogHeader>
        {quote && (
          <div className="flex gap-3">
            <UserAvatar user={me} />
            <div className="min-w-0 flex-1 space-y-3">
              <Textarea
                autoFocus
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What stood out to you?"
                className="min-h-24 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit()
                }}
              />
              <figure className="rounded-xl bg-panel px-4 py-3">
                <QuotesIcon weight="fill" className="mb-1 size-4 text-muted-foreground" />
                <blockquote className="line-clamp-4 font-serif text-[15px] leading-snug">{quote.text}</blockquote>
                <figcaption className="mt-2 text-xs text-muted-foreground">The Highest Power · {quote.chapterTitle}</figcaption>
              </figure>
            </div>
          </div>
        )}
        <DialogFooter className="items-center gap-2 sm:justify-between">
          <Select value={channelId} onValueChange={setChannelId}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {postable.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  # {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={submit} className="w-full sm:w-auto">
            <PaperPlaneTiltIcon weight="fill" />
            Post
            <Kbd className="ml-1 hidden bg-primary-foreground/15 text-primary-foreground sm:inline-flex">⌘↵</Kbd>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
