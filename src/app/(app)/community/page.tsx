import { CommunityView } from "@/components/community/community-view"

export const metadata = { title: "Community" }

export default function CommunityPage() {
  return <CommunityView channelId="general" />
}
