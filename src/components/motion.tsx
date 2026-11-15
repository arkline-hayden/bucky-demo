"use client"

import { motion, type HTMLMotionProps } from "motion/react"

export const ease = [0.22, 1, 0.36, 1] as const

/*
 * App screens don't perform entrances: content is simply there.
 * Motion in this app is feedback (likes, sheets, toolbars, layout changes).
 * These wrappers keep their call sites but render in place.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FadeIn({ delay, y, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return <motion.div {...props} />
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string; gap?: number }) {
  return <div className={className}>{children}</div>
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />
}

export function CountUp({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  return (
    <span className={className}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}
