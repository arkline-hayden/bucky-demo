import type { Metadata, Viewport } from "next"
import { DM_Sans, Newsreader } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], axes: ["opsz"] })
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"] })

export const metadata: Metadata = {
  title: { default: "Renewed", template: "%s · Renewed" },
  description: "Read, reflect and grow together with the Renewed book series.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a19" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${newsreader.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
