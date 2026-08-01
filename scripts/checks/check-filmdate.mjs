// Run with: node --experimental-strip-types scripts/checks/check-filmdate.mjs
import { useFilmDate } from '../../composables/useFilmDate.ts'

const { formatScreeningDate, parseScreeningDate } = useFilmDate()
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

// Edge cases
assert(formatScreeningDate('') === 'TBA', 'empty input formats as TBA')
assert(formatScreeningDate('not a date') === 'not a date', 'unparseable input returns the original string')
assert(parseScreeningDate('not a date') === 0, 'unparseable input parses to 0')
assert(parseScreeningDate('') === 0, 'empty input parses to 0')

console.log('PASS')
