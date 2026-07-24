import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isImageUrl,
  isImportScheme,
  isImportableUrl,
  parseImportUrls,
  validatePluginUrl,
} from '../utils/urlValidator.ts'
import { normalizeApiBaseUrl } from '../utils/apiConfig.ts'
import {
  arePluginsEqual,
  buildPluginQueryIndex,
  queryPluginIndex,
} from '../utils/plugin.ts'

const createPlugin = (overrides = {}) => ({
  id: 1,
  name: 'Alpha',
  description: 'First plugin',
  icon: 'A',
  author: 'Author One',
  url: 'https://github.com/example/alpha',
  updateTime: '2026-01-01T00:00:00Z',
  installCount: 10,
  ...overrides,
})

test('plugin URL validation only accepts supported install sources', () => {
  assert.equal(validatePluginUrl('https://github.com/example/repo'), null)
  assert.equal(validatePluginUrl('https://example.com/plugin.js'), null)

  for (const value of [
    'tel://10086',
    'shortcuts://run-shortcut?name=x',
    'ftp://example.com/plugin.js',
    '  javascript:alert(1)',
    'https://',
    'scripting://run_script?id=1',
  ]) {
    assert.notEqual(validatePluginUrl(value), null, value)
  }
})

test('import scheme parsing validates, filters and deduplicates nested URLs', () => {
  const urls = [
    'https://github.com/example/repo',
    'https://github.com/example/repo',
    'ftp://example.com/plugin.js',
  ]
  const scheme = `scripting://import_scripts?urls=${encodeURIComponent(JSON.stringify(urls))}`

  assert.equal(isImportScheme(scheme), true)
  assert.deepEqual(parseImportUrls(scheme), ['https://github.com/example/repo'])
  assert.equal(validatePluginUrl(scheme), null)
  assert.notEqual(validatePluginUrl('scripting://import_scripts?urls=%5B%5D'), null)
})

test('image and importable URL checks reject malformed or active data URLs', () => {
  assert.equal(isImportableUrl('https://raw.githubusercontent.com/example/plugin.js'), true)
  assert.equal(isImportableUrl('https://example.com/plugin.txt'), false)
  assert.equal(isImageUrl('data:image/png;base64,AAAA'), true)
  assert.equal(isImageUrl('data:text/html,<script>alert(1)</script>'), false)
  assert.equal(isImageUrl('https://'), false)
})

test('API base URL normalization removes trailing slashes and rejects invalid schemes', () => {
  assert.equal(normalizeApiBaseUrl(' https://example.com/ '), 'https://example.com')
  assert.equal(normalizeApiBaseUrl('http://localhost:3000/api/'), 'http://localhost:3000/api')
  assert.equal(normalizeApiBaseUrl('https://'), null)
  assert.equal(normalizeApiBaseUrl('file:///tmp/api'), null)
})

test('plugin query index sorts deterministically and searches all indexed fields', () => {
  const plugins = [
    createPlugin(),
    createPlugin({
      id: 2,
      name: 'Beta',
      description: 'Second plugin',
      author: 'Author Two',
      updateTime: '2026-02-01T00:00:00Z',
      installCount: 10,
    }),
    createPlugin({
      id: 3,
      name: 'Gamma',
      description: 'Search target',
      author: 'Author Three',
      updateTime: 'invalid',
      installCount: 1,
    }),
  ]
  const index = buildPluginQueryIndex(plugins)

  assert.deepEqual(queryPluginIndex(index).map(plugin => plugin.id), [2, 1, 3])
  assert.deepEqual(
    queryPluginIndex(index, { sortType: 'popular' }).map(plugin => plugin.id),
    [2, 1, 3],
  )
  assert.deepEqual(
    queryPluginIndex(index, { searchTerm: 'target' }).map(plugin => plugin.id),
    [3],
  )
  assert.deepEqual(
    queryPluginIndex(index, { searchTerm: 'author two' }).map(plugin => plugin.id),
    [2],
  )
})

test('plugin equality compares the complete rendered snapshot', () => {
  const plugin = createPlugin()
  assert.equal(arePluginsEqual([plugin], [{ ...plugin }]), true)
  assert.equal(arePluginsEqual([plugin], [{ ...plugin, installCount: 11 }]), false)
  assert.equal(arePluginsEqual([plugin], []), false)
})
