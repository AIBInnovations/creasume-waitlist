import { zipSync, strToU8 } from 'fflate'

// XML 1.0 forbids these control characters in text cells.
// eslint-disable-next-line no-control-regex
const xml = (value) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c])
const column = (index) => {
  let label = ''
  for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) label = String.fromCharCode(65 + (n - 1) % 26) + label
  return label
}

// Inline strings keep creator-controlled text from becoming spreadsheet formulas.
export function createCreatorWorkbook(profiles, origin = '') {
  const rows = [[
    'Username', 'Name', 'Instagram URL', 'Media kit preview URL', 'Bio', 'Category',
    'Website', 'Profile picture URL', 'Followers', 'Following', 'Posts',
    'Estimated engagement rate (%)', 'Source', 'Fetched at', 'Cache status',
  ], ...profiles.filter((p) => !p.isSampleFallback).map((p) => [
    p.username, p.fullName, `https://www.instagram.com/${encodeURIComponent(p.username)}/`,
    `${origin}/preview?lookup=${encodeURIComponent(p.username)}`, p.bio, p.category,
    p.externalUrl, p.profilePicture, p.followers, p.following, p.posts,
    p.engagementRateEstimate, p.source, p.fetchedAt, p.stale ? 'Stale cache' : p.cached ? 'Cached' : 'Fetched',
  ])]
  const sheet = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => `<c r="${column(c)}${r + 1}" ${typeof value === 'number' && Number.isFinite(value) ? `t="n"><v>${value}</v>` : `t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is>`}</c>`).join('')}</row>`).join('')}</sheetData><autoFilter ref="A1:O${rows.length}"/></worksheet>`
  const files = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Creators" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet,
  }
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)])))
}

export function downloadCreatorWorkbook(profiles) {
  const url = URL.createObjectURL(new Blob([createCreatorWorkbook(profiles, window.location.origin)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'creasume-creators.xlsx'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
