import { notFound } from "next/navigation"
import { BookDetail } from "@/components/book-detail"
import { books, getBook } from "@/lib/books"

export const dynamicParams = false

export function generateStaticParams() {
  return books.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return { title: getBook(slug)?.title }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!getBook(slug)) notFound()
  return <BookDetail slug={slug} />
}
