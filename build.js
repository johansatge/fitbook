const ejs = require('ejs')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const pkg = require('./package.json')
const crypto = require('crypto')
const esbuild = require('esbuild')

try {
  const { FITBOOK_DROPBOX_APP_KEY } = require('./.env.js')
  process.env.FITBOOK_DROPBOX_APP_KEY = FITBOOK_DROPBOX_APP_KEY
} catch (error) {
  /* do nothing */
}

const srcDir = path.join(__dirname, 'app')
const distDir = path.join(__dirname, '.dist')

build()
if (process.argv.includes('--watch')) {
  const httpdir = require('/usr/local/lib/node_modules/httpdir')
  const server = httpdir.createServer({ basePath: '.dist', httpPort: 4000 })
  server.onStart(({ urls }) => {
    console.log(urls.join('\n'))
  })
  server.start()
  buildOnChange()
}

async function buildOnChange() {
  console.log(`Watching ${srcDir}`)
  fs.watch(srcDir, { recursive: true }, (evtType, file) => {
    console.log(`Event ${evtType} on ${file}, building...`)
    build()
  })
}

async function build() {
  try {
    const startTime = new Date().getTime()
    await cleanDist()
    const ejsTemplates = await buildEjsTemplates()
    const assets = {}
    const { indexJs, loginJs } = await buildJs(ejsTemplates)
    assets.index = indexJs
    assets.login = loginJs
    assets.styles = await buildCss()
    const icons = await buildIcons()
    await renderIndexHtml({ assets, icons })
    await renderLoginHtml({ assets })
    await fsp.copyFile(path.join(__dirname, '_headers'), path.join(distDir, '_headers'))
    const endTime = new Date().getTime()
    log(`Done in ${endTime - startTime}ms`)
  } catch (error) {
    log(error.message)
    log(error.stack)
    process.exit(1)
  }
}

async function buildOnChange() {
  log(`Watching ${srcDir}`)
  fs.watch(srcDir, { recursive: true }, (evtType, file) => {
    log(`Event ${evtType} on ${file}, building...`)
    build()
  })
}

async function cleanDist() {
  log(`Cleaning ${distDir}`)
  try {
    await fsp.rm(distDir, { recursive: true })
  } catch (error) {
    // nothing
  }
  await fsp.mkdir(distDir, { recursive: true })
}

async function buildEjsTemplates() {
  log('Building EJS templates')
  const feed = await buildEjsTemplate('app/feed.ejs')
  const add = await buildEjsTemplate('app/add.ejs')
  return { feed, add }
}

async function buildEjsTemplate(templatePath) {
  const contents = await fsp.readFile(templatePath, 'utf8')
  const compiled = ejs.compile(contents, {
    client: true,
    compileDebug: false,
    strict: true,
    localsName: 'data',
  })
  return compiled.toString()
}

async function buildJs(ejsTemplates) {
  log('Building JS assets')
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, 'app/index.js'), path.join(__dirname, 'app/login.js')],
    bundle: true,
    minify: true,
    entryNames: '[name].[hash]',
    outdir: distDir,
    metafile: true,
    define: {
      __DROPBOX_APP_KEY__: JSON.stringify(process.env.FITBOOK_DROPBOX_APP_KEY),
      __EJS_FEED__: JSON.stringify(ejsTemplates.feed),
      __EJS_ADD__: JSON.stringify(ejsTemplates.add),
    },
    external: ['crypto', 'util'], // Dropbox is using those for Node compat
  })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0])
  }
  const assets = Object.keys(result.metafile.outputs)
  return {
    indexJs: path.parse(assets[0]).base,
    loginJs: path.parse(assets[1]).base,
  }
}

async function buildCss() {
  log('Building CSS assets')
  const files = [
    'vars',
    'reset',
    'button',
    'navbar',
    'floatingbutton',
    'toast',
    'feed',
    'footer',
    'login',
    'addoverlay',
    'menuoverlay',
    'stopwatchoverlay',
  ]
  let css = ''
  for (const file of files) {
    const contents = await fsp.readFile(path.join(__dirname, `app/styles/${file}.css`), 'utf8')
    css += contents + '\n\n'
  }
  css = css.replace(/\n/g, ' ')
  css = css.replace(/ {2,}/g, '')
  css = css.replace(/\/\*[^*]*\*\//g, '')
  const hash = crypto.createHash('sha1').update(css).digest('hex')
  const filename = `styles.${hash}.css`
  await fsp.writeFile(path.join(distDir, filename), css, 'utf8')
  return filename
}

async function buildIcons() {
  log('Building SVG icons')
  const iconsPath = path.join(__dirname, 'app/icons')
  const files = (await fsp.readdir(iconsPath)).filter((file) => file.endsWith('.svg'))
  const svgs = []
  for (const file of files) {
    const svg = await fsp.readFile(path.join(iconsPath, file), 'utf8')
    svgs.push(svg.replace('<svg ', `<svg id="svg-${path.parse(file).name}" `))
  }
  return svgs
}

async function renderIndexHtml({ assets, icons }) {
  log('Rendering HTML (index)')
  const ejsTemplate = await fsp.readFile(path.join(__dirname, 'app/index.ejs'), 'utf8')
  const html = ejs.render(ejsTemplate, {
    assets,
    icons,
    appTitle: pkg.name,
    appTitleFull: `${pkg.name} ${pkg.version}`,
  })
  await fsp.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
}

async function renderLoginHtml({ assets }) {
  log('Rendering HTML (login)')
  const ejsTemplate = await fsp.readFile(path.join(__dirname, 'app/login.ejs'), 'utf8')
  const html = ejs.render(ejsTemplate, {
    assets,
    appTitle: pkg.name,
    appTitleFull: `${pkg.name} ${pkg.version}`,
    dropboxAppKey: process.env.FITBOOK_DROPBOX_APP_KEY,
  })
  await fsp.writeFile(path.join(distDir, 'login.html'), html, 'utf8')
}

function log(message) {
  console.log(message) // eslint-disable-line no-console
}
