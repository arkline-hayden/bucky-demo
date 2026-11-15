import { theHighestPowerChapters } from "@/content/the-highest-power"
import type { Book, Chapter } from "@/lib/types"

export const SERIES_NAME = "Renewed"
export const AUTHOR_NAME = "Bucky"

export const books: Book[] = [
  {
    id: "book-1",
    slug: "the-highest-power",
    number: 1,
    title: "The Highest Power",
    tagline: "Everyone has a higher power. Is yours the Highest?",
    description:
      "It begins on a bench outside a rehab facility at 4:30 in the morning, under a crescent moon. Book one asks the question underneath every addiction, idol and counterfeit: what are you really running to when life falls apart? A raw, Scripture-first look at the difference between the god we make and the God who made us.",
    status: "available",
    chapters: theHighestPowerChapters,
    cover: { from: "#0e1a2b", to: "#24395a", ink: "#e9ecf1", accent: "#e2b864", motif: "moon" },
  },
  {
    id: "book-2",
    slug: "the-first-repentance",
    number: 2,
    title: "The First Repentance",
    tagline: "Stop aiming at ourselves. Start aiming at Him.",
    description:
      "What it really means to turn around. Repentance isn't a feeling of regret but a change of direction, and the first one changes everything that follows.",
    status: "coming-soon",
    releaseDate: "2027-01-12",
    chapters: [],
    cover: { from: "#3a1420", to: "#6b2a36", ink: "#f6e7e2", accent: "#f0a58f", motif: "turn" },
  },
  {
    id: "book-3",
    slug: "identity",
    number: 3,
    title: "Identity",
    tagline: "Identified by God, not by your past.",
    description:
      "Your history is not your name. Book three looks at who God says you are, and how to live from that instead of toward it.",
    status: "coming-soon",
    releaseDate: "2027-03-09",
    chapters: [],
    cover: { from: "#13312f", to: "#245652", ink: "#e5f2ec", accent: "#8fd1bd", motif: "mark" },
  },
  {
    id: "book-4",
    slug: "endurance",
    number: 4,
    title: "Endurance",
    tagline: "Suffering produces endurance.",
    description:
      "Consistency over perfection. What the gym teaches about the long obedience of faith, and why showing up is half the battle.",
    status: "coming-soon",
    releaseDate: "2027-05-11",
    chapters: [],
    cover: { from: "#3b2312", to: "#71431f", ink: "#f8eadb", accent: "#f2b77a", motif: "mountain" },
  },
  {
    id: "book-5",
    slug: "wholly-reliance",
    number: 5,
    title: "Wholly Reliance",
    tagline: "Lean not on your own understanding.",
    description:
      "Letting go of the wheel. A practical look at trusting God with the things we've always insisted on carrying ourselves.",
    status: "coming-soon",
    releaseDate: "2027-07-13",
    chapters: [],
    cover: { from: "#1c2a17", to: "#38502b", ink: "#ecf1e1", accent: "#b9d38c", motif: "hands" },
  },
  {
    id: "book-6",
    slug: "relapse",
    number: 6,
    title: "Relapse",
    tagline: "Falling back, and getting back up.",
    description:
      "An honest book about falling back into sin, the shame that follows, and the grace that is bigger than both.",
    status: "coming-soon",
    releaseDate: "2027-09-14",
    chapters: [],
    cover: { from: "#241a33", to: "#433160", ink: "#efe8f7", accent: "#c3a6ec", motif: "mend" },
  },
  {
    id: "book-7",
    slug: "designed-to-refresh",
    number: 7,
    title: "Designed to Refresh",
    tagline: "Renewed to pour out.",
    description:
      "The final step. Those who have been refreshed are designed to refresh others. Book seven is about walking beside the next person.",
    status: "coming-soon",
    releaseDate: "2027-11-09",
    chapters: [],
    cover: { from: "#0c2738", to: "#17506b", ink: "#e3f2f8", accent: "#7cc8e6", motif: "water" },
  },
]

export function getBook(idOrSlug: string): Book | undefined {
  return books.find((b) => b.id === idOrSlug || b.slug === idOrSlug)
}

export function getChapter(book: Book, chapterId: string): Chapter | undefined {
  return book.chapters.find((c) => c.id === chapterId)
}

export const wordCount = (s: string) => s.trim().split(/\s+/).length

const chapterWordCache = new Map<string, number[]>()

/** Cumulative word counts per paragraph (index i = words in paragraphs 0..i). */
export function paragraphWordTotals(chapter: Chapter): number[] {
  const cached = chapterWordCache.get(chapter.id)
  if (cached) return cached
  let sum = 0
  const totals = chapter.paragraphs.map((p) => (sum += wordCount(p)))
  chapterWordCache.set(chapter.id, totals)
  return totals
}

export function chapterWords(chapter: Chapter) {
  const t = paragraphWordTotals(chapter)
  return t[t.length - 1] ?? 0
}

export function bookWords(book: Book) {
  return book.chapters.reduce((n, c) => n + chapterWords(c), 0)
}

export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 230))
}
