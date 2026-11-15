export type Role = "member" | "admin" | "author" | "moderator"

export interface User {
  id: string
  username: string
  password: string
  displayName: string
  avatarUrl?: string
  avatarColor: string
  bio: string
  location?: string
  role: Role
  joinedAt: string
}

export interface ReflectionQuestion {
  id: string
  text: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  paragraphs: string[]
  reflections: ReflectionQuestion[]
}

export type CoverMotif = "moon" | "turn" | "mark" | "mountain" | "hands" | "mend" | "water"

export interface Book {
  id: string
  slug: string
  number: number
  title: string
  tagline: string
  description: string
  status: "available" | "coming-soon"
  releaseDate?: string
  chapters: Chapter[]
  cover: { from: string; to: string; ink: string; accent: string; motif: CoverMotif }
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink"

export interface Highlight {
  id: string
  bookId: string
  chapterId: string
  paragraph: number
  start: number
  end: number
  text: string
  color: HighlightColor
  note?: string
  createdAt: string
  updatedAt: string
}

export interface ChapterProgress {
  furthest: number
  completedAt?: string
}

export interface BookProgress {
  chapters: Record<string, ChapterProgress>
  lastChapterId: string
  lastParagraph: number
  lastReadAt: string
  startedAt: string
}

export interface ReflectionAnswer {
  text: string
  updatedAt: string
}

export type ReaderFont = "sans" | "serif"
export type ReaderWidth = "narrow" | "normal" | "wide"
export type ReaderLeading = "compact" | "normal" | "relaxed"

export interface ReaderPrefs {
  fontSize: number
  font: ReaderFont
  width: ReaderWidth
  leading: ReaderLeading
}

export interface UserData {
  progress: Record<string, BookProgress>
  highlights: Highlight[]
  reflections: Record<string, ReflectionAnswer>
  readerPrefs: ReaderPrefs
  notifyBooks: string[]
  readingLog: Record<string, number>
  notifications: { replies: boolean; announcements: boolean; weeklyDigest: boolean; newBooks: boolean }
}

export interface Reply {
  id: string
  authorId: string
  body: string
  createdAt: string
  likes: string[]
}

export interface Post {
  id: string
  channelId: string
  authorId: string
  title?: string
  body: string
  createdAt: string
  likes: string[]
  replies: Reply[]
  pinned?: boolean
  quote?: { text: string; bookId: string; chapterId: string; paragraph: number }
}

export interface Channel {
  id: string
  name: string
  description: string
  kind: "announcements" | "discussion"
  group: "Community" | "Books"
  bookId?: string
}
