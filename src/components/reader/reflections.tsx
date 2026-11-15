"use client"

import { CheckCircleIcon, CircleNotchIcon, LockKeyIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { friendlyDay } from "@/lib/format"
import { useAppStore, useMyData } from "@/lib/store"
import type { Chapter } from "@/lib/types"

export function Reflections({ chapter }: { chapter: Chapter }) {
  const answers = useMyData().reflections
  const answered = chapter.reflections.filter((q) => answers[q.id]).length
  return (
    <section aria-labelledby="reflect-heading" className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="reflect-heading" className="font-sans text-[22px] font-semibold tracking-[-0.02em]">
            Reflection
          </h2>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 rounded-[5px] bg-muted px-2 py-1 font-sans text-xs text-muted-foreground">
              <LockKeyIcon className="size-3" /> Private
            </span>
          </TooltipTrigger>
          <TooltipContent>Only you can see your reflections</TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-2 font-sans text-[15px] text-muted-foreground">
        {answered === chapter.reflections.length ? "You answered every question. Come back and add to them anytime." : "Sit with this chapter. Your answers save as you type."}
      </p>
      <div className="mt-6 space-y-4 font-sans">
        {chapter.reflections.map((q, i) => (
          <Question key={q.id} index={i + 1} id={q.id} text={q.text} />
        ))}
      </div>
    </section>
  )
}

function Question({ index, id, text }: { index: number; id: string; text: string }) {
  const saved = useMyData().reflections[id]
  const setReflection = useAppStore((s) => s.setReflection)
  const [value, setValue] = useState(saved?.text ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.max(96, el.scrollHeight)}px`
  }, [value])

  useEffect(() => () => clearTimeout(timer.current), [])

  function onChange(v: string) {
    setValue(v)
    setStatus("saving")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setReflection(id, v)
      setStatus("saved")
    }, 600)
  }

  return (
    <div className="rounded-2xl bg-panel p-4 transition-colors focus-within:bg-muted sm:p-5">
      <label htmlFor={id} className="flex gap-3 text-[15px] leading-relaxed font-medium">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs text-muted-foreground tabular-nums">{index}</span>
        {text}
      </label>
      <Textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer…"
        className="mt-3 min-h-24 resize-none border-none bg-transparent px-9 py-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="mt-2 flex h-4 items-center justify-end pr-1 text-xs text-muted-foreground">
        <AnimatePresence mode="wait" initial={false}>
          {status === "saving" ? (
            <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
              <CircleNotchIcon className="size-3 animate-spin" /> Saving
            </motion.span>
          ) : saved ? (
            <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
              <CheckCircleIcon weight="fill" className="size-3" />
              {status === "saved" ? "Saved" : `Saved ${friendlyDay(saved.updatedAt)}`}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
