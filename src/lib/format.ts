import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns"

export function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return "just now"
  if (diff < 7 * 864e5) {
    return formatDistanceToNowStrict(d, { roundingMethod: "floor" })
      .replace(/ seconds?/, "s")
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
  }
  return format(d, d.getFullYear() === new Date().getFullYear() ? "MMM d" : "MMM d, yyyy")
}

export function fullDate(iso: string) {
  return format(new Date(iso), "EEEE, MMMM d, yyyy 'at' h:mm a")
}

export function friendlyDay(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`
  return format(d, "MMM d 'at' h:mm a")
}

export function releaseDate(iso: string) {
  return format(new Date(`${iso}T12:00:00`), "MMMM d, yyyy")
}

export function shortRelease(iso: string) {
  return format(new Date(`${iso}T12:00:00`), "MMM d")
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return "Still up"
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export const plural = (n: number, word: string, pluralWord = `${word}s`) => `${n} ${n === 1 ? word : pluralWord}`
