import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'
import { unzipSync, strFromU8 } from 'fflate'
import { createCreatorWorkbook } from '../../admin/src/services/creatorWorkbook.js'

const queries = []
let duplicate = false
const lead = { updateOne: async (...args) => { if (duplicate) { duplicate = false; throw Object.assign(Error('duplicate'), { code: 11000 }) } queries.push(args) } }
const module = { exports: {} }
vm.runInNewContext(readFileSync('../../backend/services/lookupLeadService.js', 'utf8'), { require: () => lead, module, console })
const { captureLookup } = module.exports
await captureLookup('@Test.User', { username: 'Test.User', followers: 0, fullName: '=safe & <text>', accessToken: 'secret' })
assert.equal(queries[0][0].username, 'test.user')
assert.equal(queries[0][1].$set.profile.followers, 0)
assert.equal(queries[0][1].$set.profile.accessToken, undefined)
assert.equal(queries[0][1].$inc.lookupCount, 1)
assert.equal(queries[0][2].upsert, true)
await captureLookup('test.user', null, { error: 'Unavailable' })
assert.equal(queries[1][1].$set.lastStatus, 'failed')
assert.equal(queries[1][1].$set.profile, undefined) // Keep last successful data.
await captureLookup('invalid/name', {})
assert.equal(queries.length, 2)
duplicate = true
await captureLookup('test.user', { username: 'test.user' })
assert.equal(queries.length, 3)
assert.equal(queries[2][2].upsert, undefined)

const calls = [], routes = {}
const router = { get(path, ...handlers) { routes[path] = handlers.at(-1) }, post() {}, put() {}, delete() {}, use() {} }
let missing = false
vm.runInNewContext(readFileSync('../../backend/routes/public.js', 'utf8'), {
  require: (name) => {
    if (name === 'express') return { Router: () => router }
    if (name === '../services/lookupLeadService') return { captureLookup: async (...args) => calls.push(args) }
    if (name === '../services/instagramApiService') return { isEnabled: () => true, fetchProfileViaApi: async (username) => {
      if (missing) throw Object.assign(Error('Not found'), { status: 404 })
      return { username, fullName: 'Real profile', followers: 0 }
    } }
    return {}
  }, module: { exports: {} }, console, process: { env: {} }, URL, setTimeout, clearTimeout,
})
async function lookup(username) {
  const response = { code: 200, status(code) { this.code = code; return this }, json(data) { this.data = data; return this } }
  await routes['/lookup/:username']({ params: { username } }, response)
  return response
}
assert.equal((await lookup('test.user')).data.success, true)
assert.equal(calls.length, 1)
assert.equal((await lookup('test.user')).data.cached, true)
assert.equal(calls[1][2].cached, true)
missing = true
assert.equal((await lookup('missing.user')).code, 404)
assert.equal(calls[2][2].error, 'Not found')
assert.equal((await lookup('invalid/name')).code, 400)
assert.equal(calls.length, 3)

let guarded = false
const adminProtect = () => {}
const adminRoutes = {}
const adminRouter = { use(middleware) { assert.equal(middleware, adminProtect); guarded = true }, get(path, handler) { assert.ok(guarded); adminRoutes[path] = handler } }
vm.runInNewContext(readFileSync('../../backend/routes/adminLookups.js', 'utf8'), {
  require: (name) => {
    if (name === 'express') return { Router: () => adminRouter }
    if (name === '../middleware/adminMiddleware') return { adminProtect }
    return {}
  }, module: { exports: {} }, console,
})
assert.equal(typeof adminRoutes['/'], 'function')
assert.equal(typeof adminRoutes['/export'], 'function')

const bytes = createCreatorWorkbook([{ username: 'test.user', fullName: '=safe & <text>', followers: 0, lookupCount: 2, lastStatus: 'success' }], 'https://creasume.com')
const files = unzipSync(bytes)
assert.equal(Object.keys(files).length, 5)
const xml = strFromU8(files['xl/worksheets/sheet1.xml'])
assert.match(xml, /A1:T2/)
assert.match(xml, /=safe &amp; &lt;text&gt;/)
assert.match(xml, /https:\/\/creasume.com\/preview/)
assert.ok(!xml.includes('<f>'))
writeFileSync('../artifacts/team-workbook-validation.xlsx', bytes)
writeFileSync('../artifacts/creator-details-template.xlsx', createCreatorWorkbook([]))
console.log('PASS: capture upsert, dedup retry, failed lookup, field allowlist, live/cache/missing/invalid routes and admin XLSX with tracking fields.')
