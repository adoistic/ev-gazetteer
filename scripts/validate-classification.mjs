// Checks every classification line against the fixed vocabularies. A tag
// outside them is a build error, not something to be quietly normalised.

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function loadClassification() {
  const dir = path.join(root, 'data', 'classification')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.psv')).sort()
  const vocab = JSON.parse(await readFile(path.join(root, 'data', 'vocabulary.json'), 'utf8'))
  const rows = new Map()
  const errors = []

  const split = (s) => (s === '-' || s === '' ? [] : s.split(';').map((x) => x.trim()).filter(Boolean))

  for (const file of files) {
    const text = await readFile(path.join(dir, file), 'utf8')
    text.split('\n').forEach((line, n) => {
      if (!line.trim()) return
      const parts = line.split('|')
      const where = `${file}:${n + 1}`
      if (parts.length !== 10) {
        errors.push(`${where}: expected 10 fields, got ${parts.length}`)
        return
      }
      const [id, fields, topics, outputs, purpose, country, origin, stage, age, org] = parts.map((p) => p.trim())
      const rec = {
        id: Number(id),
        fields: split(fields),
        topics: split(topics),
        outputs: split(outputs),
        purpose,
        country: country === '?' || country === '-' ? null : country,
        origin: origin === '-' || origin === '?' ? null : origin,
        stage,
        age: age === '-' ? null : Number(age),
        org: org === '-' ? null : org,
      }
      if (rows.has(rec.id)) errors.push(`${where}: duplicate id ${rec.id}`)
      if (!rec.fields.length) errors.push(`${where}: no field for ${rec.id}`)
      for (const f of rec.fields) if (!vocab.field[f]) errors.push(`${where}: unknown field "${f}"`)
      for (const o of rec.outputs) if (!vocab.output[o]) errors.push(`${where}: unknown output "${o}"`)
      if (!vocab.purpose[rec.purpose]) errors.push(`${where}: unknown purpose "${rec.purpose}"`)
      if (!vocab.stage[rec.stage]) errors.push(`${where}: unknown stage "${rec.stage}"`)
      if (rec.age !== null && (!Number.isInteger(rec.age) || rec.age < 8 || rec.age > 90)) {
        errors.push(`${where}: implausible age ${rec.age}`)
      }
      rows.set(rec.id, rec)
    })
  }
  return { rows, errors, vocab }
}

if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const { rows, errors, vocab } = await loadClassification()
  if (errors.length) {
    console.error(`${errors.length} problems:`)
    for (const e of errors.slice(0, 40)) console.error('  ' + e)
    process.exit(1)
  }
  const count = (key) => {
    const c = new Map()
    for (const r of rows.values()) for (const v of [].concat(r[key])) c.set(v, (c.get(v) ?? 0) + 1)
    return [...c.entries()].sort((a, b) => b[1] - a[1])
  }
  console.log(`${rows.size} classifications, all tags inside the vocabulary.`)
  console.log('\nFields:')
  for (const [k, v] of count('fields')) console.log(`  ${String(v).padStart(4)}  ${vocab.field[k]}`)
  console.log('\nPurpose:')
  for (const [k, v] of count('purpose')) console.log(`  ${String(v).padStart(4)}  ${vocab.purpose[k]}`)
  console.log('\nStage:')
  for (const [k, v] of count('stage')) console.log(`  ${String(v).padStart(4)}  ${vocab.stage[k]}`)
  const topics = count('topics')
  console.log(`\n${topics.length} distinct topics. Top 20:`)
  for (const [k, v] of topics.slice(0, 20)) console.log(`  ${String(v).padStart(4)}  ${k}`)
  const countries = count('country').filter(([k]) => k)
  console.log(`\n${countries.length} countries. Top 12:`)
  for (const [k, v] of countries.slice(0, 12)) console.log(`  ${String(v).padStart(4)}  ${k}`)
}
