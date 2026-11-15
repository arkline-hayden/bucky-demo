import type { HighlightColor } from "@/lib/types"

/** Full class names so Tailwind can see them. */
export const HL_SOLID: Record<HighlightColor, string> = {
  yellow: "bg-hl-yellow-solid",
  green: "bg-hl-green-solid",
  blue: "bg-hl-blue-solid",
  pink: "bg-hl-pink-solid",
}

export const HL_SOFT: Record<HighlightColor, string> = {
  yellow: "hl-yellow",
  green: "hl-green",
  blue: "hl-blue",
  pink: "hl-pink",
}
