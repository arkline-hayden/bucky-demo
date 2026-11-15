import { notFound } from "next/navigation"
import { CommunityView } from "@/components/community/community-view"
import { channels } from "@/lib/seed"

export const dynamicParams = false

export function generateStaticParams() {
  return channels.map((c) => ({ channel: c.id }))
}

type Params = { params: Promise<{ channel: string }> }

export async function generateMetadata({ params }: Params) {
  const { channel } = await params
  return { title: `#${channel} · Community` }
}

export default async function ChannelPage({ params }: Params) {
  const { channel } = await params
  if (!channels.some((c) => c.id === channel)) notFound()
  return <CommunityView key={channel} channelId={channel} />
}
