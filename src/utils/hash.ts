export function generateHash(userId: string, examId: string): string {
  const raw = `${userId}-${examId}-${Date.now()}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
}

export function generatePublicUrl(hash: string): string {
  return `${window.location.origin}/certificate/${hash}`
}
