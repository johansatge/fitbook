const ejs = require('ejs')
const fsp = require('fs').promises
const path = require('path')
const pkg = require('./package.json')
const crypto = require('crypto')
const esbuild = require('esbuild')

const distDir = path.join(__dirname, '.dist')
const { FITBOOK_DROPBOX_APP_KEY } = require('./.env.js')

build()

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
    const endTime = new Date().getTime()
    log(`Done in ${endTime - startTime}ms`)
  } catch (error) {
    log(error.message)
    log(error.stack)
    process.exit(1)
  }
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
      __DROPBOX_APP_KEY__: JSON.stringify(FITBOOK_DROPBOX_APP_KEY),
      __EJS_FEED__: JSON.stringify(ejsTemplates.feed),
      __EJS_ADD__: JSON.stringify(ejsTemplates.add),
    },
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
  const cssPath = path.join(__dirname, 'app/styles/styles.css')
  let css = await fsp.readFile(cssPath, 'utf8')
  css = css.replace(/\n/g, ' ')
  css = css.replace(/ {2,}/g, '')
  css = css.replace(/\/\*[^*]*\*\//g, '')
  const hash = crypto
    .createHash('sha1')
    .update(css)
    .digest('hex')
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
    dropboxAppKey: FITBOOK_DROPBOX_APP_KEY,
  })
  await fsp.writeFile(path.join(distDir, 'login.html'), html, 'utf8')
}

function log(message) {
  console.log(message) // eslint-disable-line no-console
}
