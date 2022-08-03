const fs = require('fs')
const atom = require('./sources/atomcorp.json')
const gogh = require('./sources/gogh.json')

const themes = {}

const stripAll = (name) => name.toLowerCase().replace(/[^a-z0-9]/gi, '')

for (const theme of atom) {
  themes[stripAll(theme.name)] = theme
}
for (const theme of gogh) {
  if (stripAll(theme.name) in themes) continue
  themes[stripAll(theme.name)] = theme
}

const toSlug = (name) => name.replace(/([A-Z][a-z0-9])/g, '-$1').toLowerCase().replace(/\s+/g, '-').replace(/^-+|-+$/g, '').replace(/-{1,}/g, '-').replace(/[^a-z0-9-]/gi, '')
const toString = (theme) => {
  return `${theme.meta?.credits && theme.meta.credits.map(x => `/* ${x.name} - ${x.link} */`).join('\n') || ''}
[theme="${toSlug(theme.name)}"] {
${Object.entries(theme).filter(x => x[0] !== 'name' && typeof x[1] === 'string').map(([key, value]) =>
    `  --${key}: ${value};`).join('\n')}
}
`.trim()
}

const sort = (a, b) => stripAll(a.name) > stripAll(b.name) ? 1 : -1
for (const theme of Object.values(themes).sort(sort)) {
  fs.writeFileSync(__dirname + '/themes/' + toSlug(theme.name) + '.css', toString(theme), 'utf-8')
  fs.writeFileSync(__dirname + '/themes/' + toSlug(theme.name) + '.json', JSON.stringify(theme, null, 2), 'utf-8')
}

fs.writeFileSync(__dirname + '/themes/_all.css', Object.values(themes).sort(sort).map(theme => toString(theme)).join('\n'), 'utf-8')
fs.writeFileSync(__dirname + '/themes/_all.json', JSON.stringify(Object.values(themes).sort(sort), null, 2), 'utf-8')
fs.writeFileSync(__dirname + '/themes/_names.json', JSON.stringify(Object.values(themes).sort(sort).map(theme => toSlug(theme.name)), null, 2), 'utf-8')
fs.writeFileSync(__dirname + '/themes/_names-dark.json', JSON.stringify(Object.values(themes)
  .filter(x => parseInt(x.background.slice(1), 16) < 0x555555)
  .sort(sort).map(theme => toSlug(theme.name)), null, 2), 'utf-8')
fs.writeFileSync(__dirname + '/themes/_names-light.json', JSON.stringify(Object.values(themes)
  .filter(x => parseInt(x.background.slice(1), 16) >= 0x555555)
  .sort(sort).map(theme => toSlug(theme.name)), null, 2), 'utf-8')
