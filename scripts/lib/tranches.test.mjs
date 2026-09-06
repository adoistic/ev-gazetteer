import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isMainCohort, programmeOf, compareBatches, PROGRAMMES } from './tranches.mjs'

test('numeric batches are the main series', () => {
  assert.equal(isMainCohort('54'), true)
  assert.equal(isMainCohort('1'), true)
  assert.equal(isMainCohort(' 58 '), true)
})

test('named tranches are not the main series', () => {
  assert.equal(isMainCohort('India 15'), false)
  assert.equal(isMainCohort('Africa 3'), false)
  assert.equal(isMainCohort('Covid Prize 1'), false)
  assert.equal(isMainCohort('Progress Studies Tranche'), false)
  assert.equal(isMainCohort('India (Oct 2020)'), false)
})

test('batches map to the right programme', () => {
  assert.equal(programmeOf('India 15'), 'india')
  assert.equal(programmeOf('India (Oct 2020)'), 'india')
  assert.equal(programmeOf('Africa 3'), 'africa')
  assert.equal(programmeOf('Covid Prize 4'), 'covid')
  assert.equal(programmeOf('Progress Studies Tranche'), 'progress')
})

test('main series batches have no programme', () => {
  assert.equal(programmeOf('54'), null)
  assert.equal(programmeOf(''), null)
})

test('batches sort naturally', () => {
  const sorted = ['India 10', 'India 2', 'India 9'].sort(compareBatches)
  assert.deepEqual(sorted, ['India 2', 'India 9', 'India 10'])
})

test('every programme has an id, label and blurb', () => {
  for (const p of PROGRAMMES) {
    assert.ok(p.id && p.label && p.blurb, `incomplete programme ${p.id}`)
  }
})
