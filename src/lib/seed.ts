import { getBook } from "@/lib/books"
import { dayKey } from "@/lib/progress"
import type { Channel, Highlight, HighlightColor, Post, ReaderPrefs, Reply, User, UserData } from "@/lib/types"

export const DEMO_USERNAME = "jordan"
export const DEMO_PASSWORD = "renewed"
export const DEMO_USER_ID = "u-jordan"

const avatar = (n: number) => `https://i.pravatar.cc/240?img=${n}`

export const defaultReaderPrefs: ReaderPrefs = { fontSize: 19, font: "sans", width: "normal", leading: "normal" }

export function emptyUserData(): UserData {
  return {
    progress: {},
    highlights: [],
    reflections: {},
    readerPrefs: { ...defaultReaderPrefs },
    notifyBooks: [],
    readingLog: {},
    notifications: { replies: true, announcements: true, weeklyDigest: false, newBooks: true },
  }
}

export function seedUsers(now: number): User[] {
  const joined = (daysAgo: number) => new Date(now - daysAgo * 864e5).toISOString()
  return [
    { id: DEMO_USER_ID, username: DEMO_USERNAME, password: DEMO_PASSWORD, displayName: "Jordan Avery", avatarUrl: avatar(33), avatarColor: "#6b7280", bio: "Husband, dad of two, recovering perfectionist. Reading slow and taking notes.", location: "Overland Park, KS", role: "member", joinedAt: joined(24) },
    { id: "u-bucky", username: "bucky", password: "", displayName: "Bucky", avatarColor: "#c99a4b", bio: "Author of the Renewed series. Construction company and gym owner. Equipping to Flourish Ministry.", location: "Cass County, MO", role: "author", joinedAt: joined(120) },
    { id: "u-team", username: "renewed", password: "", displayName: "Renewed Team", avatarColor: "#1f2937", bio: "Official updates, releases and live events for the Renewed series.", role: "admin", joinedAt: joined(120) },
    { id: "u-grace", username: "gracew", password: "", displayName: "Grace Whitfield", avatarUrl: avatar(47), avatarColor: "#a16207", bio: "Community moderator. Recovery coach. Coffee first.", location: "Lee's Summit, MO", role: "moderator", joinedAt: joined(110) },
    { id: "u-marcus", username: "marcusb", password: "", displayName: "Marcus Bell", avatarUrl: avatar(68), avatarColor: "#065f46", bio: "Moderator. 6 years sober. Lifting heavy things for the glory of God.", location: "Belton, MO", role: "moderator", joinedAt: joined(108) },
    { id: "u-elena", username: "elena.r", password: "", displayName: "Elena Ruiz", avatarUrl: avatar(44), avatarColor: "#9d174d", bio: "Nurse, mom, and new to all of this.", role: "member", joinedAt: joined(60) },
    { id: "u-tyler", username: "tokafor", password: "", displayName: "Tyler Okafor", avatarUrl: avatar(59), avatarColor: "#1e40af", bio: "Member at the gym since 2021.", role: "member", joinedAt: joined(55) },
    { id: "u-sam", username: "sampatt", password: "", displayName: "Sam Patterson", avatarUrl: avatar(14), avatarColor: "#7c2d12", bio: "Day 212.", role: "member", joinedAt: joined(40) },
    { id: "u-dani", username: "danib", password: "", displayName: "Danielle Brooks", avatarUrl: avatar(32), avatarColor: "#9a3412", bio: "Small group leader at Harrisonville Community.", role: "member", joinedAt: joined(38) },
    { id: "u-chris", username: "chrisn", password: "", displayName: "Chris Nguyen", avatarUrl: avatar(52), avatarColor: "#0f766e", bio: "Engineer. Asking a lot of questions.", role: "member", joinedAt: joined(31) },
    { id: "u-hannah", username: "hannahlee", password: "", displayName: "Hannah Lee", avatarUrl: avatar(26), avatarColor: "#be123c", bio: "Reading with my husband in the evenings.", role: "member", joinedAt: joined(29) },
    { id: "u-josh", username: "jcarter", password: "", displayName: "Josh Carter", avatarUrl: avatar(13), avatarColor: "#374151", bio: "Contractor. Dad. Work in progress.", role: "member", joinedAt: joined(22) },
    { id: "u-ruth", username: "ruthm", password: "", displayName: "Ruth Mendoza", avatarUrl: avatar(49), avatarColor: "#92400e", bio: "Grandma of 7. Prayer warrior.", role: "member", joinedAt: joined(18) },
    { id: "u-derek", username: "dshaw", password: "", displayName: "Derek Shaw", avatarUrl: avatar(11), avatarColor: "#155e75", bio: "", role: "member", joinedAt: joined(12) },
    { id: "u-kayla", username: "kaylas", password: "", displayName: "Kayla Simmons", avatarUrl: avatar(9), avatarColor: "#86198f", bio: "Worship team. Book nerd.", role: "member", joinedAt: joined(9) },
    { id: "u-nate", username: "nateh", password: "", displayName: "Nate Holloway", avatarUrl: avatar(53), avatarColor: "#3f6212", bio: "", role: "member", joinedAt: joined(5) },
  ]
}

export const channels: Channel[] = [
  { id: "announcements", name: "announcements", description: "Official updates from Bucky and the Renewed team.", kind: "announcements", group: "Community" },
  { id: "general", name: "general", description: "Introduce yourself and talk about anything.", kind: "discussion", group: "Community" },
  { id: "prayer-requests", name: "prayer-requests", description: "Share what you're carrying. We'll pray with you.", kind: "discussion", group: "Community" },
  { id: "testimonies", name: "testimonies", description: "Stories of what God is doing. Big or small.", kind: "discussion", group: "Community" },
  { id: "the-highest-power", name: "the-highest-power", description: "Book 1 discussion. Chapter by chapter, at your own pace.", kind: "discussion", group: "Books", bookId: "book-1" },
  { id: "the-first-repentance", name: "the-first-repentance", description: "Book 2 discussion. Opens with the January 12 release.", kind: "discussion", group: "Books", bookId: "book-2" },
]

function findHighlight(chapterId: string, phrase: string) {
  const book = getBook("book-1")!
  const chapter = book.chapters.find((c) => c.id === chapterId)!
  const paragraph = chapter.paragraphs.findIndex((p) => p.includes(phrase))
  if (paragraph < 0) throw new Error(`Seed highlight not found: ${phrase}`)
  const start = chapter.paragraphs[paragraph].indexOf(phrase)
  return { chapterId, paragraph, start, end: start + phrase.length, text: phrase }
}

export function seedJordanData(now: number): UserData {
  const iso = (hoursAgo: number) => new Date(now - hoursAgo * 36e5).toISOString()
  const hl = (id: string, chapterId: string, phrase: string, color: HighlightColor, hoursAgo: number, note?: string): Highlight => ({
    id,
    bookId: "book-1",
    ...findHighlight(chapterId, phrase),
    color,
    note,
    createdAt: iso(hoursAgo),
    updatedAt: iso(hoursAgo),
  })

  const readingLog: Record<string, number> = {}
  const minutes = [0, 22, 18, 31, 14, 26, 19, 0, 0, 12, 24, 0, 9, 16]
  minutes.forEach((m, i) => {
    if (!m) return
    const d = new Date(now - i * 864e5)
    readingLog[dayKey(d)] = m
  })
  // Today hasn't been read yet, so the streak shows yesterday's run (6 days).
  delete readingLog[dayKey(new Date(now))]

  return {
    ...emptyUserData(),
    progress: {
      "book-1": {
        startedAt: iso(24 * 13),
        lastReadAt: iso(17),
        lastChapterId: "knowing-god",
        lastParagraph: 12,
        chapters: {
          introduction: { furthest: 17, completedAt: iso(24 * 12) },
          idols: { furthest: 7, completedAt: iso(24 * 9) },
          "the-counterfeit-jesus": { furthest: 25, completedAt: iso(24 * 4) },
          "knowing-god": { furthest: 12 },
        },
      },
    },
    highlights: [
      hl("h1", "introduction", "Every one of them gave me happiness, but never joy.", "yellow", 24 * 12.5, "This is me. Chasing happiness and calling it joy."),
      hl("h2", "introduction", "To show you how big I am.", "green", 24 * 12.3, "Read this three times. Going on the bathroom mirror."),
      hl("h3", "introduction", "Everyone has a higher power of some kind, but is it the Highest Power?", "blue", 24 * 12.1),
      hl("h4", "idols", "whatever is so central to your life that losing it would leave you feeling like life isn't worth living has become more than a gift", "pink", 24 * 9.4, "For me this is my career. Hard to admit, but it's true."),
      hl("h5", "idols", "These weren't idols on a shelf. They were idols in the heart.", "yellow", 24 * 9.2),
      hl("h6", "the-counterfeit-jesus", "We keep the verses that comfort us and skip the ones that cost us.", "yellow", 24 * 6, "Ouch. I do this with Luke 9:23."),
      hl("h7", "the-counterfeit-jesus", "They never wanted advice. They wanted agreement.", "blue", 24 * 5.5),
      hl("h8", "the-counterfeit-jesus", "Jesus doesn't need us poor. He wants us willing.", "green", 24 * 4.2, "Bring this to men's group Thursday."),
      hl("h9", "the-counterfeit-jesus", "It's the theology of a bumper sticker.", "yellow", 24 * 4.1),
      hl("h10", "knowing-god", "You trust them in the dark because you know what they're like in the light.", "green", 18, "I want to know God like this, not just know about Him."),
      hl("h11", "knowing-god", "When you know the one holding the fire, you stop asking why he lit it and start asking what he's making.", "yellow", 17.5),
    ],
    reflections: {
      "introduction-q1": { text: "Honestly? For a long time it was work. Being the guy who has it together. I'd say Jesus out loud, but the thing I ran to when life fell apart was another project, another win.", updatedAt: iso(24 * 12) },
      "introduction-q2": { text: "Busyness, mostly. And my phone at night. Not alcohol, but the same thing Bucky describes: anything to not sit still with the empty part.", updatedAt: iso(24 * 12) },
      "introduction-q3": { text: "Happiness is a good quarter at work. Joy was the morning I sat on the porch with my daughter and didn't check my email once. I want more of the second.", updatedAt: iso(24 * 12) },
      "idols-q1": { text: "My career. It's a good gift. But my mood rises and falls with it the way the chapter describes parents and report cards.", updatedAt: iso(24 * 9) },
      "idols-q2": { text: "I'd be crushed. That tells me it's sitting in a seat that isn't its own.", updatedAt: iso(24 * 9) },
      "idols-q3": { text: "Told my wife tonight. She wasn't surprised, which says a lot. We prayed about it together.", updatedAt: iso(24 * 9) },
      "the-counterfeit-jesus-q1": { text: "I love \"do not be anxious.\" I skip \"take up your cross daily.\" The Jesus I've built would never ask me to slow down.", updatedAt: iso(24 * 4) },
      "the-counterfeit-jesus-q2": { text: "My brother-in-law. He's the only one who pushes back. I've been avoiding him lately, which probably means I should call him.", updatedAt: iso(24 * 4) },
      "the-counterfeit-jesus-q3": { text: "Control. My calendar is my real possessions.", updatedAt: iso(24 * 4) },
    },
    notifyBooks: ["book-2"],
    readingLog,
  }
}

export function seedPosts(now: number): Post[] {
  const t = (minutesAgo: number) => new Date(now - minutesAgo * 6e4).toISOString()
  const H = 60
  const D = 24 * H
  let r = 0
  const reply = (authorId: string, body: string, minutesAgo: number, likes: string[] = []): Reply => ({ id: `r${++r}`, authorId, body, createdAt: t(minutesAgo), likes })

  return [
    // ── announcements ─────────────────────────────────────────────
    {
      id: "p-welcome", channelId: "announcements", authorId: "u-bucky", pinned: true, createdAt: t(21 * D),
      title: "Welcome to Renewed",
      body: "I'm so glad you're here. This community exists for one reason: so nobody walks this road alone.\n\nRead at your own pace. Take notes. Answer the reflection questions honestly; nobody sees them but you. And when something hits you, bring it here. Somebody else needs to hear it.\n\nYou don't have to clean yourself up first. Welcome home.",
      likes: ["u-jordan", "u-grace", "u-marcus", "u-elena", "u-tyler", "u-sam", "u-dani", "u-chris", "u-hannah", "u-josh", "u-ruth", "u-kayla", "u-nate", "u-derek"],
      replies: [
        reply("u-ruth", "Praise God for this. Sharing with my whole Bible study.", 20.8 * D, ["u-bucky", "u-grace"]),
        reply("u-sam", "Needed this today more than you know. Thank you.", 20 * D, ["u-bucky", "u-marcus", "u-jordan"]),
        reply("u-bucky", "@sampatt proud of you, brother. Keep showing up.", 19.9 * D, ["u-sam", "u-marcus", "u-grace", "u-jordan"]),
      ],
    },
    {
      id: "p-live", channelId: "announcements", authorId: "u-team", createdAt: t(2 * D + 3 * H),
      title: "Live Q&A with Bucky · Thursday, Nov 20 at 7:00 PM CT",
      body: "We're going live from the gym to talk through Book 1. Bring your questions on idols, the counterfeit Jesus and knowing God. Drop them in the replies and we'll get to as many as we can.\n\nThe replay will be posted here for anyone who can't make it.",
      likes: ["u-grace", "u-marcus", "u-elena", "u-tyler", "u-dani", "u-chris", "u-hannah", "u-josh", "u-kayla"],
      replies: [
        reply("u-chris", "Question: how do you tell the difference between enjoying a good gift and it becoming an idol before it's too late?", 2 * D, ["u-dani", "u-jordan", "u-hannah"]),
        reply("u-hannah", "My husband and I will be watching together. Can't wait.", 1.8 * D, ["u-team"]),
        reply("u-team", "@chrisn great question. That one is going first.", 1.7 * D, ["u-chris", "u-grace"]),
      ],
    },
    {
      id: "p-book2", channelId: "announcements", authorId: "u-team", createdAt: t(6 * D),
      title: "Book 2, The First Repentance, arrives January 12",
      body: "The next step in the series is almost here. \"This is where the journey begins. The next step is learning what it means to turn around.\"\n\nTurn on notifications from the Library and we'll let you know the moment it unlocks.",
      likes: ["u-jordan", "u-grace", "u-marcus", "u-sam", "u-dani", "u-ruth", "u-kayla", "u-elena"],
      replies: [reply("u-dani", "Our small group is planning to start it together the week it drops!", 5.8 * D, ["u-team", "u-grace"])],
    },
    {
      id: "p-update", channelId: "announcements", authorId: "u-team", createdAt: t(11 * D),
      title: "New: reflections save automatically",
      body: "Your answers to the end-of-chapter reflection questions now save as you type, and you'll find all of them in your Notebook. They're private to you.",
      likes: ["u-elena", "u-tyler", "u-chris", "u-jordan"],
      replies: [],
    },

    // ── general ───────────────────────────────────────────────────
    {
      id: "p-g1", channelId: "general", authorId: "u-nate", createdAt: t(3 * H + 12),
      body: "New here. My wife found this through the gym's Instagram. Honestly not sure what I believe yet but the first chapter got me. That bench story. Hi everyone.",
      likes: ["u-grace", "u-marcus", "u-ruth", "u-kayla"],
      replies: [
        reply("u-grace", "Welcome Nate! No pressure to have it figured out. Glad you're here.", 2 * H + 50, ["u-nate"]),
        reply("u-marcus", "That bench story got me too, man. Read slow. Ask anything.", 2 * H + 20, ["u-nate", "u-grace"]),
      ],
    },
    {
      id: "p-g2", channelId: "general", authorId: "u-kayla", createdAt: t(9 * H),
      body: "Anyone else switch the reader to the serif font and the warm dark mode at night? It feels like reading an actual book. 10/10.",
      likes: ["u-hannah", "u-dani", "u-elena"],
      replies: [reply("u-hannah", "Yes!! and bumping the font size up one notch for my old eyes (haha)", 8 * H, ["u-kayla"])],
    },
    {
      id: "p-g3", channelId: "general", authorId: "u-jordan", createdAt: t(4 * D + 2 * H),
      body: "Hey all, Jordan here. Married, two kids, from Overland Park. A buddy from the gym handed me Book 1 and said \"just read the intro.\" Three chapters later, here I am. Glad to be reading alongside you.",
      likes: ["u-grace", "u-marcus", "u-tyler", "u-josh", "u-ruth"],
      replies: [
        reply("u-tyler", "Welcome Jordan! Which gym?", 4 * D, ["u-jordan"]),
        reply("u-jordan", "The one in Belton. 5:30am crew.", 3.9 * D, ["u-tyler", "u-marcus"]),
        reply("u-marcus", "5:30 crew represent. See you Thursday.", 3.9 * D, ["u-jordan"]),
      ],
    },
    {
      id: "p-g4", channelId: "general", authorId: "u-dani", createdAt: t(7 * D),
      body: "Small group leaders: we're doing one chapter a week plus the reflection questions out loud. It's been the best discussion we've had all year. Happy to share our guide if helpful.",
      likes: ["u-grace", "u-ruth", "u-hannah", "u-chris", "u-team"],
      replies: [
        reply("u-grace", "Please share! Pinning a link in here when you do.", 6.9 * D, ["u-dani"]),
        reply("u-ruth", "I'd love a copy for our Tuesday ladies.", 6.5 * D, ["u-dani"]),
      ],
    },

    // ── book 1 ────────────────────────────────────────────────────
    {
      id: "p-b1", channelId: "the-highest-power", authorId: "u-chris", createdAt: t(5 * H),
      body: "Chapter 4 (Knowing God). The gym membership analogy is uncomfortably accurate. I've been paying the membership for 15 years and never picked up the weight.",
      quote: { text: "Many people treat God the way some people treat a gym membership. They sign up, they wear the t-shirt, but they never pick up the weight.", bookId: "book-1", chapterId: "knowing-god", paragraph: 4 },
      likes: ["u-jordan", "u-marcus", "u-tyler", "u-josh", "u-sam"],
      replies: [
        reply("u-marcus", "And the line after it: you can't fake the work. That's the whole thing.", 4 * H, ["u-chris", "u-jordan"]),
        reply("u-josh", "Felt this one in my bones.", 3 * H, ["u-chris"]),
      ],
    },
    {
      id: "p-b2", channelId: "the-highest-power", authorId: "u-elena", createdAt: t(20 * H),
      body: "The enmeshment part in Idols. I never had a word for it, but that's exactly what happened between me and my oldest. My mood rises and falls with her choices. Praying for wisdom on how to love her without making her my god.",
      quote: { text: "Our mood rises and falls with their report card, their ball game, their choices.", bookId: "book-1", chapterId: "idols", paragraph: 2 },
      likes: ["u-ruth", "u-hannah", "u-dani", "u-grace", "u-kayla"],
      replies: [
        reply("u-ruth", "Been there, sweetheart. It gets better when you hand her back to Him. Every morning.", 19 * H, ["u-elena", "u-grace"]),
        reply("u-grace", "Thank you for being honest about this. It takes courage.", 18 * H, ["u-elena"]),
      ],
    },
    {
      id: "p-b3", channelId: "the-highest-power", authorId: "u-tyler", createdAt: t(2 * D + 6 * H),
      body: "The rich young ruler section. \"He wanted the promise. He just didn't want the price.\" Read it to my brother over the phone and we both just sat there for a minute.",
      likes: ["u-jordan", "u-marcus", "u-sam", "u-derek"],
      replies: [reply("u-sam", "That line wrecked me too.", 2 * D, ["u-tyler"])],
    },
    {
      id: "p-b4", channelId: "the-highest-power", authorId: "u-bucky", createdAt: t(3 * D),
      body: "Love seeing y'all working through this together. A question for the group as you read the Counterfeit chapters: what is a verse you tend to skip? Be honest. I'll go first: for years it was \"go and sin no more.\"",
      likes: ["u-jordan", "u-grace", "u-marcus", "u-elena", "u-tyler", "u-sam", "u-chris", "u-hannah", "u-josh", "u-ruth", "u-kayla"],
      replies: [
        reply("u-jordan", "Luke 9:23. \"Take up his cross daily.\" I love the first half of that verse, not so much the daily part.", 2.9 * D, ["u-bucky", "u-marcus", "u-chris"]),
        reply("u-hannah", "\"Wives, submit...\" and I'm working on it", 2.8 * D, ["u-kayla", "u-dani"]),
        reply("u-chris", "Anything about rest. I treat the Sabbath like a suggestion.", 2.7 * D, ["u-bucky"]),
        reply("u-bucky", "This is exactly it. Thank you for your honesty. That's where the real Jesus starts working.", 2.6 * D, ["u-jordan", "u-hannah", "u-chris"]),
      ],
    },
    {
      id: "p-b5", channelId: "the-highest-power", authorId: "u-derek", createdAt: t(5 * D),
      body: "Question about the Introduction: the chaplain says having a higher power gives you a real shot. What did people in AA here think about \"higher power\" language before reading this?",
      likes: ["u-marcus", "u-sam"],
      replies: [
        reply("u-marcus", "In the rooms it was helpful to start, but it stayed vague for me for too long. This book named it.", 4.9 * D, ["u-derek", "u-sam"]),
        reply("u-sam", "The trees and grass line. I had a lot of trees-and-grass years.", 4.8 * D, ["u-derek", "u-marcus", "u-jordan"]),
      ],
    },

    // ── prayer ────────────────────────────────────────────────────
    {
      id: "p-pr1", channelId: "prayer-requests", authorId: "u-sam", createdAt: t(6 * H),
      body: "Day 212 today. Tomorrow is a hard anniversary for me. Would appreciate prayers for tonight and tomorrow morning.",
      likes: ["u-jordan", "u-grace", "u-marcus", "u-ruth", "u-tyler", "u-kayla", "u-bucky"],
      replies: [
        reply("u-ruth", "Praying for you right now, Sam.", 5 * H, ["u-sam"]),
        reply("u-marcus", "Call me tonight if you need. You know the number.", 4 * H, ["u-sam", "u-grace"]),
      ],
    },
    {
      id: "p-pr2", channelId: "prayer-requests", authorId: "u-hannah", createdAt: t(1 * D + 4 * H),
      body: "My dad has a biopsy on Friday. We're trusting the God who sees, but my heart is heavy.",
      likes: ["u-ruth", "u-kayla", "u-dani", "u-elena", "u-grace"],
      replies: [reply("u-dani", "Lifting your dad up. He is the one who heals.", 1 * D, ["u-hannah"])],
    },
    {
      id: "p-pr3", channelId: "prayer-requests", authorId: "u-josh", createdAt: t(3 * D + 8 * H),
      body: "Business is slow and I'm tempted to go back to old ways of coping. Pray I stay on the rock and not the sand.",
      likes: ["u-jordan", "u-tyler", "u-marcus"],
      replies: [reply("u-bucky", "Been right where you are, Josh. Same God who carried our gym through 2020. Praying.", 3 * D, ["u-josh", "u-marcus", "u-jordan"])],
    },

    // ── testimonies ───────────────────────────────────────────────
    {
      id: "p-t1", channelId: "testimonies", authorId: "u-marcus", createdAt: t(1 * D + 9 * H),
      body: "Six years sober yesterday. I tried every cure Bucky lists in the intro. None of them were enough. Only One was. Thank you all for being family.",
      likes: ["u-jordan", "u-grace", "u-elena", "u-tyler", "u-sam", "u-dani", "u-chris", "u-ruth", "u-bucky", "u-kayla", "u-nate"],
      replies: [
        reply("u-bucky", "Six years! So proud of you, brother.", 1 * D, ["u-marcus"]),
        reply("u-sam", "You're the reason I made it to day 212. Love you man.", 22 * H, ["u-marcus", "u-grace"]),
      ],
    },
    {
      id: "p-t2", channelId: "testimonies", authorId: "u-elena", createdAt: t(8 * D),
      body: "After reading Hope in the Storm I finally called my sister for the first time in three years. We talked for two hours. God is so good.",
      likes: ["u-ruth", "u-hannah", "u-grace", "u-dani"],
      replies: [],
    },
  ]
}

export function seedAll(now = Date.now()) {
  return {
    users: seedUsers(now),
    posts: seedPosts(now),
    userData: { [DEMO_USER_ID]: seedJordanData(now) } as Record<string, UserData>,
  }
}

export const bookById = (id: string) => getBook(id)
