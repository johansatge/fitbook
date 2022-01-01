const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatDate(dateInput, outputFormat) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const prefixZero = (num) => (num >= 10 ? num : `0${num}`)
  let output = outputFormat
  output = output.replaceAll('YYYY', date.getFullYear()) // Full year, 4 digits
  output = output.replaceAll('MMMM', months[date.getMonth()]) // Readable month
  output = output.replaceAll('dddd', days[date.getDay()]) // Readable day of week
  output = output.replaceAll('MM', prefixZero(date.getMonth() + 1)) // Month, 2 digits
  output = output.replaceAll('DD', prefixZero(date.getDate())) // Day of month, 2 digits
  output = output.replaceAll('HH', prefixZero(date.getHours())) // Hours, 2 digits
  output = output.replaceAll('mm', prefixZero(date.getMinutes())) // Minutes, 2 digits
  output = output.replaceAll('ss', prefixZero(date.getSeconds())) // Seconds, 2 digits
  output = output.replaceAll('Do', getDayOfMonth(date)) // Day of month + readable suffix
  return output
}

function getDayOfMonth(date) {
  const day = date.getDate()
  if (day % 10 === 1 && day !== 11) return `${day}st`
  if (day % 10 === 2 && day !== 12) return `${day}nd`
  if (day % 10 === 3 && day !== 13) return `${day}rd`
  return `${day}th`
}
