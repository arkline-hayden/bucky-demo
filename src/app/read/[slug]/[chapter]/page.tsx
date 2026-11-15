import { notFound } from "next/navigation"
import { Reader } from "@/components/reader/reader"
import { books, getBook, getChapter } from "@/lib/books"

export const dynamicParams = false

export function generateStaticParams() {
  return books.flatMap((b) => b.chapters.map((c) => ({ slug: b.slug, chapter: c.id })))
}

type Params = { params: Promise<{ slug: string; chapter: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug, chapter } = await params
  const book = getBook(slug)
  const ch = book && getChapter(book, chapter)
  return { title: ch ? `${ch.title} · ${book.title}` : "Reader" }
}

export default async function ReadPage({ params }: Params) {
  const { slug, chapter } = await params
  const book = getBook(slug)
  if (!book || !getChapter(book, chapter)) notFound()
  return <Reader key={`${slug}/${chapter}`} slug={slug} chapterId={chapter} />
}
