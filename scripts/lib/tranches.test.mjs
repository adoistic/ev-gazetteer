import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seriesOf, trancheOf, compareBatches } from './tranches.mjs'

test('batches map to a series', () => {
  assert.equal(seriesOf('54'), 'main')
  assert.equal(seriesOf('India 15'), 'india')
  assert.equal(seriesOf('India (Oct 2020)'), 'india')
  assert.equal(seriesOf('Africa 3'), 'africa')
  assert.equal(seriesOf('Covid Prize 4'), 'covid')
  assert.equal(seriesOf('Progress Studies Tranche'), 'progress')
})

test('tranches hidden inside cohorts are found in the text', () => {
  assert.equal(trancheOf('Ukraine tranche: Kyiv, piano.'), 'ukraine')
  assert.equal(trancheOf('Ukraine cohort. Le Sallay Academy'), 'ukraine')
  assert.equal(trancheOf('Dartmouth, archaeology tranche, drone radar'), 'archaeology')
  assert.equal(trancheOf('biographies of scientists, science education tranche'), 'science-education')
  assert.equal(trancheOf('podcast on women in science, science communication tranche'), 'science-communication')
  assert.equal(trancheOf('Berlin, AI policy research.'), null)
})

test('batches sort naturally', () => {
  assert.deepEqual(['India 10', 'India 2', 'India 9'].sort(compareBatches), ['India 2', 'India 9', 'India 10'])
})
