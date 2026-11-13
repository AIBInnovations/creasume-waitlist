import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'
import { unzipSync, strFromU8 } from 'fflate'
import { createCreatorWorkbook } from './src/services/creatorWorkbook.js'

const book = createCreatorWorkbook([
  { username: 'real.creator', fullName: '=FORMULA & <name>', followers: 0, following: 10, posts: 20, stale: true },
  { username: 'fake', isSampleFallback: true },
], 'https://example.com')
const files = unzipSync(book)
assert.equal(Object.keys(files).length, 5)
const sheet = strFromU8(files['xl/worksheets/sheet1.xml'])
assert.match(sheet, /t="n"><v>0<\/v>/)
assert.match(sheet, /=FORMULA &amp; &lt;name&gt;/)
assert.match(sheet, /https:\/\/www.instagram.com\/real.creator\//)
assert.match(sheet, /Stale cache/)
assert.ok(!sheet.includes('<f>') && !sheet.includes('fake'))
writeFileSync('../artifacts/creator-details-template.xlsx', createCreatorWorkbook([]))

let handler, middleware, filter, deleted = { _id: 'a'.repeat(24) }, fail = false
const protect = () => {}
const router = { get() {}, post() {}, put() {}, delete(path, auth, fn) { assert.equal(path, '/delete/:id'); middleware = auth; handler = fn } }
vm.runInNewContext(readFileSync('../../backend/routes/inquiry.js', 'utf8'), {
  require: (id) => {
    if (id === 'express') return { Router: () => router }
    if (id === '../models/Inquiry') return { findOneAndDelete: async (query) => { filter = query; if (fail) throw Error('Database unavailable'); return deleted } }
    if (id === '../middleware/authMiddleware') return { protect }
    if (id === '../services/benchmarkService') return { checkBenchmark: async () => {} }
    return {}
  }, module: { exports: {} }, console,
})
assert.equal(middleware, protect)
async function call(id) {
  const result = { statusCode: 200, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } }
  await handler({ params: { id }, creator: { _id: 'owner' } }, result)
  return result
}
assert.equal((await call('bad')).statusCode, 400)
assert.equal(filter, undefined)
assert.equal((await call('a'.repeat(24))).body.success, true)
assert.equal(filter.creatorId, 'owner')
assert.equal(filter._id, 'a'.repeat(24))
deleted = null
assert.equal((await call('b'.repeat(24))).statusCode, 404)
fail = true
assert.equal((await call('a'.repeat(24))).statusCode, 500)
console.log('PASS: Excel structure, literal text safety, real-only rows, URLs, zero counts, stale data; authenticated ownership-scoped delete, invalid id, missing inquiry and DB failure.')
