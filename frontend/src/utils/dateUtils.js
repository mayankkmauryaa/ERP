export const formatDate = (date) => {
  if (!date) return ""
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${month}-${day}`
}

// Format date to readable format (e.g., Jan 15, 2024)
export const formatDateReadable = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get current month and year
export const getCurrentMonthYear = () => {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}
