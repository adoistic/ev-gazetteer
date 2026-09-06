import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadRows } from './build-data.mjs'
import { isMainCohort } from './lib/tranches.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const csv = path.join(root, 'data', 'ev-winners.csv')

test('keeps exactly the regional and thematic winners', async () => {
  const rows = await loadRows(csv)
  assert.equal(rows.length, 469)
})

test('no main series winner survives', async () => {
  const rows = await loadRows(csv)
  assert.equal(rows.filter((w) => isMainCohort(w.batch)).length, 0)
})

test('programme totals match the spec', async () => {
  const rows = await loadRows(csv)
  const count = (id) => rows.filter((w) => w.programme === id).length
  assert.equal(count('india'), 345)
  assert.equal(count('africa'), 104)
  assert.equal(count('covid'), 11)
  assert.equal(count('progress'), 9)
})

test('every winner has embeddable text and an id', async () => {
  const rows = await loadRows(csv)
  for (const w of rows) {
    assert.ok(Number.isInteger(w.id), `bad id for ${w.name}`)
    assert.ok(w.embedText && w.embedText.length > 0, `no embed text for ${w.name}`)
  }
})

test('Adnan Abbasi is present with his India 15 announcement', async () => {
  const rows = await loadRows(csv)
  const adnan = rows.find((w) => w.id === 1070)
  assert.ok(adnan, 'row 1070 missing')
  assert.equal(adnan.name, 'Adnan Abbasi')
  assert.equal(adnan.batch, 'India 15')
  assert.equal(adnan.date, '2025-12-26')
  assert.match(adnan.link, /marginalrevolution\.com/)
})

test('empty markers become null rather than a dash', async () => {
  const rows = await loadRows(csv)
  assert.equal(rows.some((w) => w.description === '-' || w.type === '-'), false)
})
