// Enforces the Thothica Black rules on the built output rather than by eye.
// Exits non zero on any violation.

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(root, 'out')

const BANNED_WORDS = [
  'delve', 'crucial', 'robust', 'comprehensive', 'nuanced', 'multifaceted',
  'leverage', 'foster', 'showcase', 'holistic', 'seamless', 'cutting-edge',
  'transformative', 'revolutionary', 'game-changer', 'unlock', 'unleash',
  'demystify', 'beacon', 'realm', 'symphony', 'tapestry', 'plethora',
  'myriad', 'paramount',
]

/** Black and white in every notation the toolchain might emit. */
const OK_COLOR = /^(#(000|fff|0000|ffff|000000|ffffff|00000000|ffffffff)|transparent|none|currentcolor|inherit|initial|unset)$/i

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

const problems = []
const waived = []
const note = (file, rule, detail) => problems.push({ file: path.relative(root, file), rule, detail })

/**
 * The dark mode palette, listed value by value.
 *
 * Light mode is still strictly two ink. Dark mode is not, deliberately: pure
 * white on pure black is 21:1, which haloes and tires the eye over a long
 * list. These exact values are permitted and nothing else is, so a stray grey
 * still fails the build.
 */
const DARK_PALETTE = new Set([
  '#141414', // page ground
  '#1e1e1e', // raised band
  '#e6e6e6', // body ink, 14.8:1
  '#a0a0a0', // secondary ink, 7.1:1
  '#666', '#666666', // borders and rules, 3.2:1
  '#2f2f2f', // selected fill
  '#3a3a3a', // selected fill inside a band
])

/**
 * One standing exception, named rather than hidden.
 *
 * Next.js bundles the palette for its own crash and not found screens into the
 * client runtime whether or not they are reachable. app/error.tsx,
 * app/global-error.tsx and app/not-found.tsx replace all three, so those values
 * never reach a pixel. They are dead strings in a vendor chunk, so the rule is
 * recorded as waived here rather than relaxed for the whole build.
 */
const isFrameworkDeadCode = (text, index) =>
  text.slice(Math.max(0, index - 400), index + 200).includes('--next-error-')

const check = (file, text, index, rule, detail) => {
  if (DARK_PALETTE.has(String(detail).toLowerCase())) waived.push(`dark mode palette: ${detail}`)
  else if (isFrameworkDeadCode(text, index)) waived.push(`${rule}: ${detail}`)
  else note(file, rule, detail)
}

const files = (await walk(OUT)).filter((f) => /\.(html|css|js|txt|json)$/.test(f))

for (const file of files) {
  const text = await readFile(file, 'utf8')
  const isCode = /\.(css|html|js)$/.test(file)

  if (isCode) {
    // A hex is only a colour where CSS can see it. Grantee descriptions quote
    // things like "#6394", which is text, not a palette violation.
    const styleZones = /\.(css|js)$/.test(file)
      ? [{ start: 0, text }]
      : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>|style="([^"]*)"/g)].map((m) => ({
          start: m.index + m[0].indexOf(m[1] ?? m[2] ?? ''),
          text: m[1] ?? m[2] ?? '',
        }))
    for (const zone of styleZones) {
      for (const m of zone.text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (!OK_COLOR.test(m[0])) check(file, text, zone.start + m.index, 'non black and white hex', m[0])
      }
    }
    for (const m of text.matchAll(/rgba?\([^)]*\)/g)) {
      // rgb(0 0 0) and rgb(255 255 255) are still two ink; alpha never is.
      const nums = (m[0].match(/[\d.]+/g) ?? []).map(Number)
      const alpha = m[0].includes('rgba') || nums.length === 4
      const solid = nums.slice(0, 3).every((n) => n === 0) || nums.slice(0, 3).every((n) => n === 255)
      if (alpha || !solid) check(file, text, m.index, 'colour outside the two inks', m[0])
    }
    for (const m of text.matchAll(/opacity\s*:\s*([\d.]+)/g)) {
      if (Number(m[1]) < 1) note(file, 'opacity below 1', m[0])
    }
    for (const m of text.matchAll(/(linear|radial|conic)-gradient\([^)]*\)/g)) {
      if (!m[0].startsWith('repeating-') && !text.slice(Math.max(0, m.index - 10), m.index).includes('repeating-')) {
        check(file, text, m.index, 'gradient', m[0].slice(0, 60))
      }
    }
  }

}


// Voice rules apply to the copy this project writes. Grantee descriptions are
// quoted verbatim from the announcement posts and are not ours to rewrite, so
// they are checked from source rather than from the rendered page.
const sources = (await walk(path.join(root, 'app'))).filter((f) => /\.(tsx|ts|css)$/.test(f))
for (const file of sources) {
  const text = await readFile(file, 'utf8')
  for (const m of text.matchAll(/—|–|&#8211;|&#8212;|&mdash;|&ndash;/g)) {
    note(file, 'em or en dash in our copy', m[0])
  }
  const prose = text.toLowerCase()
  for (const w of BANNED_WORDS) {
    if (new RegExp(`\\b${w.replace('-', '[- ]')}\\b`).test(prose)) note(file, 'banned word in our copy', w)
  }
}

if (problems.length) {
  console.error(`Brand lint failed with ${problems.length} problems:\n`)
  const grouped = new Map()
  for (const p of problems) {
    const k = `${p.rule} :: ${p.file}`
    grouped.set(k, (grouped.get(k) ?? []).concat(p.detail))
  }
  for (const [k, v] of grouped) {
    console.error(`  ${k}`)
    console.error(`    ${[...new Set(v)].slice(0, 8).join(', ')}${v.length > 8 ? ` and ${v.length - 8} more` : ''}`)
  }
  process.exit(1)
}
console.log(`Brand lint clean across ${files.length} built files and ${sources.length} source files.`)
const dark = waived.filter((w) => w.startsWith('dark mode palette')).length
const chrome = waived.length - dark
if (dark) console.log(`  ${dark} values waived as the dark mode palette (see DARK_PALETTE).`)
if (chrome) console.log(`  ${chrome} values waived as unreachable framework chrome (see isFrameworkDeadCode).`)
