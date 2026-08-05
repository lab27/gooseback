// Run with: node --experimental-strip-types scripts/checks/check-filmdate.mjs
import { useFilmDate } from '../../composables/useFilmDate.ts'

const { formatScreeningDate, formatScreeningDateLong, parseScreeningDate } = useFilmDate()
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const CMS = 'Saturday, August 30 18:00'

// Display format
assert(formatScreeningDate(CMS, 2025) === '30.08 18:00', `format => ${formatScreeningDate(CMS, 2025)}`)

// The year parameter must actually take effect. This is the whole point of the task:
// bare `new Date()` also parses the CMS format, but resolves it to an arbitrary year (2001),
// which would make `year` dead code.
assert(new Date(parseScreeningDate(CMS, 2024)).getFullYear() === 2024, 'year 2024 takes effect')
assert(new Date(parseScreeningDate(CMS, 2025)).getFullYear() === 2025, 'year 2025 takes effect')
assert(parseScreeningDate(CMS, 2024) !== parseScreeningDate(CMS, 2025), 'different years parse to different instants')

// Ordering within one edition
assert(
  parseScreeningDate('Friday, August 29 18:00', 2025) < parseScreeningDate(CMS, 2025),
  'earlier screening sorts before later one'
)

// Omitted year falls back to the current year
assert(
  new Date(parseScreeningDate(CMS)).getFullYear() === new Date().getFullYear(),
  'omitted year falls back to the current year'
)

// --- The format the CMS writes now: "2026-08-28 18:00", year included ---------
//
// The yearless format let Decap 3 write a weekday computed against its default year of
// 2001 ("Tuesday, August 28" for a 2026 Friday). The site never trusted that weekday, but
// the CMS showed it to editors. These assert the new shape parses, that its own year wins
// over the `year` argument, and that the weekday is recomputed rather than carried.
const ISO = '2026-08-28 18:00'

assert(new Date(parseScreeningDate(ISO)).getFullYear() === 2026, 'ISO value carries its own year with no year argument')
assert(new Date(parseScreeningDate(ISO, 2024)).getFullYear() === 2026, 'an explicit date wins over the year argument')
assert(formatScreeningDate(ISO, 2026) === '28.08 18:00', `ISO short format => ${formatScreeningDate(ISO, 2026)}`)
assert(
  formatScreeningDateLong(ISO, 2026) === 'Friday, August 28 18:00',
  `weekday is recomputed, not taken from the file => ${formatScreeningDateLong(ISO, 2026)}`
)
// Local time, not UTC: an 18:00 screening must not drift into another hour or day.
assert(new Date(parseScreeningDate(ISO)).getHours() === 18, 'ISO value parses as local time')
assert(new Date(parseScreeningDate('2026-08-28T18:00')).getHours() === 18, 'the T spelling also parses as local time')
// The 57 migrated entries are ISO now, but a hand-authored legacy value must still work.
assert(
  formatScreeningDateLong('Saturday, August 30 18:00', 2025) === 'Saturday, August 30 18:00',
  'the pre-migration format still parses'
)

// Edge cases
assert(formatScreeningDate('') === 'TBA', 'empty input formats as TBA')
assert(formatScreeningDate('not a date') === 'not a date', 'unparseable input returns the original string')
assert(parseScreeningDate('not a date') === 0, 'unparseable input parses to 0')
assert(parseScreeningDate('') === 0, 'empty input parses to 0')

console.log('PASS')
