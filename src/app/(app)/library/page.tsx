"use client"

import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"
import { BookCover } from "@/components/book-cover"
import { Page, PageHeader } from "@/components/page-header"
import { Progress } from "@/components/ui/progress"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { books } from "@/lib/books"
import { shortRelease } from "@/lib/format"
import { bookFraction, pct } from "@/lib/progress"
import { useMyData } from "@/lib/store"
import { cn } from "@/lib/utils"

type Filter = "all" | "available" | "upcoming"

export default function LibraryPage() {
  const data = useMyData()
  const [filter, setFilter] = useState<Filter>("all")
  const shown = books.filter((b) => (filter === "all" ? true : filter === "available" ? b.status === "available" : b.status === "coming-soon"))
  const available = books.filter((b) => b.status === "available").length

  return (
    <Page>
      <PageHeader
        title="Library"
        description={`Renewed is seven books, read in order. ${available} of 7 available now.`}
        actions={
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} variant="outline" size="sm">
            <ToggleGroupItem value="all" className="px-3">All</ToggleGroupItem>
            <ToggleGroupItem value="available" className="px-3">Available</ToggleGroupItem>
            <ToggleGroupItem value="upcoming" className="px-3">Coming soon</ToggleGroupItem>
          </ToggleGroup>
        }
      />

      <motion.div layout className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((book) => {
            const f = pct(bookFraction(book, data.progress[book.id]))
            const isAvailable = book.status === "available"
            return (
              <motion.div key={book.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Link
                  href={`/library/${book.slug}`}
                  className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
                    <BookCover book={book} detail="title" className={cn(!isAvailable && "opacity-90 saturate-[0.8]")} />
                  </div>
                  <div className="mt-4 text-[15px] font-medium tracking-[-0.01em]">{book.title}</div>
                  {isAvailable ? (
                    <div className="mt-2 flex items-center gap-2.5">
                      <Progress value={f} className="h-1 flex-1" indicatorClassName="bg-brand" />
                      <span className="text-[13px] text-muted-foreground tabular-nums">{f}%</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[13px] text-muted-foreground">
                      Book {book.number} · {book.releaseDate && shortRelease(book.releaseDate)}
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </Page>
  )
}
