import Link from "next/link"
import { LogoMark } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-10 rounded-xl" />
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">This page wandered off</h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">The link may be broken, or the page may have moved.</p>
      <Button asChild className="mt-6">
        <Link href="/home">Back to home</Link>
      </Button>
    </div>
  )
}
