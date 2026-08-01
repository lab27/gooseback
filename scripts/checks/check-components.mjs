import { readFileSync } from 'node:fs'
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const grid = readFileSync('components/FilmGrid.vue', 'utf8')
assert(grid.includes('lang="pug"'), 'FilmGrid uses pug')
assert(grid.includes('ul.film-grid'), 'FilmGrid renders ul.film-grid')
assert(grid.includes('staticRemover'), 'FilmGrid strips static/public prefixes')
assert(grid.includes('useFilmDate'), 'FilmGrid uses the date composable')

const prog = readFileSync('components/EditionProgram.vue', 'utf8')
assert(prog.includes('FilmGrid'), 'EditionProgram renders FilmGrid')
assert(prog.includes('sections'), 'EditionProgram reads sections')
console.log('PASS')
