"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { dayKey } from "@/lib/progress"
import { emptyUserData, seedAll } from "@/lib/seed"
import type { Highlight, HighlightColor, Post, ReaderPrefs, User, UserData } from "@/lib/types"

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`
const nowIso = () => new Date().toISOString()

interface State {
  users: User[]
  posts: Post[]
  userData: Record<string, UserData>
  sessionUserId: string | null
  seededAt: string
}

interface Actions {
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string }
  signup: (input: { displayName: string; username: string; password: string }) => { ok: true } | { ok: false; error: string }
  logout: () => void
  updateProfile: (patch: Partial<Pick<User, "displayName" | "username" | "bio" | "location" | "avatarUrl">>) => void
  resetDemo: () => void

  recordPosition: (bookId: string, chapterId: string, paragraph: number) => void
  completeChapter: (bookId: string, chapterId: string, lastParagraph: number) => void
  addReadingMinute: () => void

  addHighlight: (h: Omit<Highlight, "id" | "createdAt" | "updatedAt">) => string
  updateHighlight: (id: string, patch: Partial<Pick<Highlight, "color" | "note">>) => void
  removeHighlight: (id: string) => void
  setReflection: (questionId: string, text: string) => void
  setReaderPrefs: (patch: Partial<ReaderPrefs>) => void
  toggleNotifyBook: (bookId: string) => void
  setNotification: (key: keyof UserData["notifications"], value: boolean) => void

  createPost: (input: { channelId: string; body: string; title?: string; quote?: Post["quote"] }) => string
  deletePost: (postId: string) => void
  togglePostLike: (postId: string) => void
  addReply: (postId: string, body: string) => void
  toggleReplyLike: (postId: string, replyId: string) => void
  deleteReply: (postId: string, replyId: string) => void
}

export type AppStore = State & Actions

function initialState(): State {
  const seed = seedAll()
  return { ...seed, sessionUserId: null, seededAt: nowIso() }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      /** Apply a change to the signed-in user's data. */
      const mutateMe = (fn: (d: UserData) => UserData) => {
        const id = get().sessionUserId
        if (!id) return
        set((s) => ({ userData: { ...s.userData, [id]: fn(s.userData[id] ?? emptyUserData()) } }))
      }
      const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

      return {
        ...initialState(),

        login(username, password) {
          const user = get().users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase().replace(/^@/, ""))
          if (!user || !user.password || user.password !== password) return { ok: false, error: "That username and password don't match." }
          set({ sessionUserId: user.id })
          return { ok: true }
        },

        signup({ displayName, username, password }) {
          const handle = username.trim().toLowerCase().replace(/^@/, "")
          if (!/^[a-z0-9._]{3,20}$/.test(handle)) return { ok: false, error: "Usernames are 3–20 characters: letters, numbers, dots and underscores." }
          if (get().users.some((u) => u.username === handle)) return { ok: false, error: "That username is taken." }
          if (password.length < 6) return { ok: false, error: "Use at least 6 characters for your password." }
          const user: User = {
            id: uid("u"),
            username: handle,
            password,
            displayName: displayName.trim() || handle,
            avatarColor: ["#9a3412", "#065f46", "#1e3a8a", "#6b21a8", "#9f1239"][Math.floor(Math.random() * 5)],
            bio: "",
            role: "member",
            joinedAt: nowIso(),
          }
          set((s) => ({ users: [...s.users, user], userData: { ...s.userData, [user.id]: emptyUserData() }, sessionUserId: user.id }))
          return { ok: true }
        },

        logout: () => set({ sessionUserId: null }),

        updateProfile(patch) {
          const id = get().sessionUserId
          if (!id) return
          set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
        },

        resetDemo() {
          const sessionUserId = get().sessionUserId
          const fresh = initialState()
          const stillExists = fresh.users.some((u) => u.id === sessionUserId)
          set({ ...fresh, sessionUserId: stillExists ? sessionUserId : null })
        },

        recordPosition(bookId, chapterId, paragraph) {
          mutateMe((d) => {
            const prev = d.progress[bookId]
            const ch = prev?.chapters[chapterId]
            const furthest = Math.max(ch?.furthest ?? 0, paragraph)
            if (prev && prev.lastChapterId === chapterId && prev.lastParagraph === paragraph && ch?.furthest === furthest) return d
            return {
              ...d,
              progress: {
                ...d.progress,
                [bookId]: {
                  startedAt: prev?.startedAt ?? nowIso(),
                  lastReadAt: nowIso(),
                  lastChapterId: chapterId,
                  lastParagraph: paragraph,
                  chapters: { ...prev?.chapters, [chapterId]: { ...ch, furthest } },
                },
              },
            }
          })
        },

        completeChapter(bookId, chapterId, lastParagraph) {
          mutateMe((d) => {
            const prev = d.progress[bookId]
            const ch = prev?.chapters[chapterId]
            if (ch?.completedAt) return d
            return {
              ...d,
              progress: {
                ...d.progress,
                [bookId]: {
                  startedAt: prev?.startedAt ?? nowIso(),
                  lastReadAt: nowIso(),
                  lastChapterId: chapterId,
                  lastParagraph,
                  chapters: { ...prev?.chapters, [chapterId]: { furthest: lastParagraph, completedAt: nowIso() } },
                },
              },
            }
          })
        },

        addReadingMinute() {
          mutateMe((d) => {
            const k = dayKey(new Date())
            return { ...d, readingLog: { ...d.readingLog, [k]: (d.readingLog[k] ?? 0) + 1 } }
          })
        },

        addHighlight(h) {
          const id = uid("h")
          mutateMe((d) => ({ ...d, highlights: [...d.highlights, { ...h, id, createdAt: nowIso(), updatedAt: nowIso() }] }))
          return id
        },
        updateHighlight(id, patch) {
          mutateMe((d) => ({ ...d, highlights: d.highlights.map((h) => (h.id === id ? { ...h, ...patch, updatedAt: nowIso() } : h)) }))
        },
        removeHighlight(id) {
          mutateMe((d) => ({ ...d, highlights: d.highlights.filter((h) => h.id !== id) }))
        },
        setReflection(questionId, text) {
          mutateMe((d) => {
            const reflections = { ...d.reflections }
            if (text.trim()) reflections[questionId] = { text, updatedAt: nowIso() }
            else delete reflections[questionId]
            return { ...d, reflections }
          })
        },
        setReaderPrefs(patch) {
          mutateMe((d) => ({ ...d, readerPrefs: { ...d.readerPrefs, ...patch } }))
        },
        toggleNotifyBook(bookId) {
          mutateMe((d) => ({ ...d, notifyBooks: toggle(d.notifyBooks, bookId) }))
        },
        setNotification(key, value) {
          mutateMe((d) => ({ ...d, notifications: { ...d.notifications, [key]: value } }))
        },

        createPost({ channelId, body, title, quote }) {
          const me = get().sessionUserId!
          const id = uid("p")
          set((s) => ({ posts: [{ id, channelId, authorId: me, title, body, quote, createdAt: nowIso(), likes: [], replies: [] }, ...s.posts] }))
          return id
        },
        deletePost(postId) {
          set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }))
        },
        togglePostLike(postId) {
          const me = get().sessionUserId
          if (!me) return
          set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, likes: toggle(p.likes, me) } : p)) }))
        },
        addReply(postId, body) {
          const me = get().sessionUserId
          if (!me) return
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, replies: [...p.replies, { id: uid("r"), authorId: me, body, createdAt: nowIso(), likes: [] }] } : p,
            ),
          }))
        },
        toggleReplyLike(postId, replyId) {
          const me = get().sessionUserId
          if (!me) return
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, replies: p.replies.map((r) => (r.id === replyId ? { ...r, likes: toggle(r.likes, me) } : r)) } : p,
            ),
          }))
        },
        deleteReply(postId, replyId) {
          set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, replies: p.replies.filter((r) => r.id !== replyId) } : p)) }))
        },
      }
    },
    {
      name: "renewed-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)

// ── Selectors ──────────────────────────────────────────────────────

export function useMe(): User | undefined {
  return useAppStore((s) => s.users.find((u) => u.id === s.sessionUserId))
}

const EMPTY = emptyUserData()
export function useMyData(): UserData {
  return useAppStore((s) => (s.sessionUserId ? s.userData[s.sessionUserId] : undefined) ?? EMPTY)
}

export function useUsersById() {
  const users = useAppStore((s) => s.users)
  return Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, User>
}

export const HIGHLIGHT_COLORS: { id: HighlightColor; label: string }[] = [
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue" },
  { id: "pink", label: "Pink" },
]
