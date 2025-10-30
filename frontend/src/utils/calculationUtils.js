export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const checkInTime = new Date(checkIn)
  const checkOutTime = new Date(checkOut)
  const diffMs = checkOutTime - checkInTime
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours.toFixed(2)
}

// Calculate total salary
export const calculateTotalSalary = (baseSalary, allowances = 0, deductions = 0) => {
  return baseSalary + allowances - deductions
}
