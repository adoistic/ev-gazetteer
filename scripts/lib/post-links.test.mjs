import { test } from 'node:test'
import assert from 'node:assert/strict'
import { blocksOf, matchBlock, linksFor, linkifyDescription, unwrapArchive } from './post-links.mjs'

test('archive prefixes are stripped', () => {
  assert.equal(
    unwrapArchive('http://web.archive.org/web/20260713130117/https://thothica.com/'),
    'https://thothica.com/'
  )
  assert.equal(unwrapArchive('https://thothica.com/'), 'https://thothica.com/')
})

test('anchors carry their position in the block', () => {
  const html = `<div class="entry-content"><p><a href="https://example.com/p">Ada Lovelace</a>, 25, founder of <a href="https://acme.test">Acme</a>, received a grant to build an engine.</p></div>`
  const [b] = blocksOf(html)
  assert.equal(b.text.slice(0, 12), 'Ada Lovelace')
  assert.equal(b.anchors[0].start, 0)
  assert.equal(b.text.slice(b.anchors[1].start, b.anchors[1].end), 'Acme')
})

test('site navigation links are dropped', () => {
  const html = `<div class="entry-content"><p><a href="https://marginalrevolution.com/category/economics">Economics</a> is a category link inside a long enough paragraph to count.</p></div>`
  assert.equal(blocksOf(html)[0].anchors.length, 0)
})

test('two grantees in one paragraph do not share links', () => {
  const html = `<div class="entry-content"><p>` +
    `<a href="https://ada.test">Ada Lovelace</a> works on engines and received a grant for that work. ` +
    `<a href="https://bob.test">Bob Stone</a> works on bridges and received a grant for that work.` +
    `</p></div>`
  const blocks = blocksOf(html)
  const ada = matchBlock('Ada Lovelace works on engines and received a grant for that work.', blocks)
  const bob = matchBlock('Bob Stone works on bridges and received a grant for that work.', blocks)
  assert.deepEqual(linksFor(ada).map((l) => l.href), ['https://ada.test'])
  assert.deepEqual(linksFor(bob).map((l) => l.href), ['https://bob.test'])
})

test('a roomy fuzzy match yields no links rather than wrong ones', () => {
  const html = `<div class="entry-content"><p>` +
    `Ada Lovelace works on engines and received a grant for that important work in London. ` +
    `<a href="https://bob.test">Bob Stone</a> is a completely separate person doing bridges elsewhere.` +
    `</p></div>`
  const blocks = blocksOf(html)
  const m = matchBlock('Ada Lovelace works on engines and received a grant for important work', blocks)
  assert.ok(m && !m.exact)
  assert.deepEqual(linksFor(m), [])
})

test('an unrelated description matches nothing', () => {
  const blocks = blocksOf('<div class="entry-content"><p>Ada Lovelace built an engine in London for the crown.</p></div>')
  assert.equal(matchBlock('Completely different grantee studying volcanoes in Iceland today', blocks), null)
})

test('description is split into linked and plain runs', () => {
  const { parts, extra } = linkifyDescription('Ada Lovelace, founder of Acme, builds engines.', [
    { text: 'Ada Lovelace', href: 'https://example.com/p' },
    { text: 'Acme', href: 'https://acme.test' },
  ])
  assert.deepEqual(parts.map((p) => p.text), ['Ada Lovelace', ', founder of ', 'Acme', ', builds engines.'])
  assert.equal(parts[0].href, 'https://example.com/p')
  assert.equal(extra.length, 0)
})

test('a link whose words are not in the description is kept separately', () => {
  const { parts, extra } = linkifyDescription('Ada builds engines.', [
    { text: 'her TedX talk', href: 'https://ted.test/x' },
  ])
  assert.equal(parts.length, 1)
  assert.deepEqual(extra, [{ text: 'her TedX talk', href: 'https://ted.test/x' }])
})
