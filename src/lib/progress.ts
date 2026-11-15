import { books, chapterWords, paragraphWordTotals } from "@/lib/books"
import type { Book, BookProgress, Chapter } from "@/lib/types"

export function chapterFraction(chapter: Chapter, progress?: BookProgress) {
  const cp = progress?.chapters[chapter.id]
  if (!cp) return 0
  if (cp.completedAt) return 1
  const totals = paragraphWordTotals(chapter)
  const total = totals[totals.length - 1] || 1
  return Math.min(1, (totals[Math.min(cp.furthest, totals.length - 1)] ?? 0) / total)
}

export function bookFraction(book: Book, progress?: BookProgress) {
  if (!progress || book.chapters.length === 0) return 0
  let read = 0
  let total = 0
  for (const c of book.chapters) {
    const w = chapterWords(c)
    total += w
    read += w * chapterFraction(c, progress)
  }
  return total ? read / total : 0
}

export const pct = (f: number) => Math.round(f * 100)

export function completedChapters(book: Book, progress?: BookProgress) {
  return book.chapters.filter((c) => progress?.chapters[c.id]?.completedAt).length
}

/** Where "Continue reading" should land. */
export function resumeTarget(book: Book, progress?: BookProgress) {
  const first = book.chapters[0]
  if (!progress || !first) return { chapter: first, paragraph: 0 }
  const last = book.chapters.find((c) => c.id === progress.lastChapterId) ?? first
  if (progress.chapters[last.id]?.completedAt) {
    const next = book.chapters[last.number] // number is 1-based → next index
    if (next) return { chapter: next, paragraph: progress.chapters[next.id]?.furthest ?? 0 }
  }
  return { chapter: last, paragraph: progress.lastParagraph }
}

export function minutesLeft(book: Book, progress?: BookProgress) {
  let words = 0
  for (const c of book.chapters) words += chapterWords(c) * (1 - chapterFraction(c, progress))
  return Math.max(0, Math.round(words / 230))
}

export function currentStreak(log: Record<string, number>) {
  let streak = 0
  const d = new Date()
  // Today counts if read; otherwise the streak can still be alive from yesterday.
  if (!log[dayKey(d)]) d.setDate(d.getDate() - 1)
  while (log[dayKey(d)]) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export const availableBooks = () => books.filter((b) => b.status === "available")
