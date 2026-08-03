import { format } from 'date-fns'

const SCREENING_PATTERN = /(\w+),?\s+(\w+)\s+(\d{1,2})\s+(\d{1,2}):(\d{2})/

/**
 * Screening dates are authored by the CMS as "Saturday, August 30 18:00" — no year.
 * The film's edition year supplies the missing piece; without it we fall back to the
 * current year, which is only correct for the current program.
 *
 * The CMS pattern is tried FIRST and deliberately so. `new Date("Saturday, August 30 18:00")`
 * succeeds on its own — V8 resolves it to an arbitrary year 2001 — so parsing directly first
 * would short-circuit the year substitution and make the `year` parameter dead code.
 */
const toDate = (dateString: string, year?: number): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null

  const parts = dateString.match(SCREENING_PATTERN)
  if (parts) {
    const [, , monthName, day, hour, minute] = parts
    const resolvedYear = year ?? new Date().getFullYear()
    const parsed = new Date(`${monthName} ${day}, ${resolvedYear} ${hour}:${minute}:00`)
    if (!isNaN(parsed.getTime())) return parsed
  }

  // Anything not in the CMS shape (e.g. a real ISO date) still parses normally.
  const direct = new Date(dateString)
  return isNaN(direct.getTime()) ? null : direct
}

export const useFilmDate = () => {
  /**
   * Grid formatter: "30.08 18:00" for the current program. Archived films pass
   * `includeYear` so visitors don't mistake a past screening for an upcoming one:
   * "30.08.2024 18:00".
   */
  const formatScreeningDate = (dateString: string, year?: number, includeYear = false): string => {
    if (!dateString) return 'TBA'
    const date = toDate(dateString, year)
    if (!date) return dateString
    return format(date, includeYear ? 'dd.MM.yyyy HH:mm' : 'dd.MM HH:mm')
  }

  /**
   * Detail-page formatter: reproduces the raw CMS shape "Saturday, August 30 18:00"
   * so the current program's appearance is unchanged. Archived films pass `includeYear`
   * to insert the edition year in place: "Saturday, August 30 2024 18:00".
   */
  const formatScreeningDateLong = (dateString: string, year?: number, includeYear = false): string => {
    if (!dateString) return 'TBA'
    const date = toDate(dateString, year)
    if (!date) return dateString
    return format(date, includeYear ? 'EEEE, MMMM d yyyy HH:mm' : 'EEEE, MMMM d HH:mm')
  }

  const parseScreeningDate = (dateString: string, year?: number): number => {
    const date = toDate(dateString, year)
    return date ? date.getTime() : 0
  }

  return { formatScreeningDate, formatScreeningDateLong, parseScreeningDate }
}
