const ejs = require('ejs')
const fsp = require('fs').promises
const glob = require('glob')
const path = require('path')
const pkg = require('./package.json')
const promisify = require('util').promisify
const webpack = require('webpack')
const webpackConfig = require('./app/webpack.config.js')

const distDir = path.join(__dirname, '.dist')
const { FITBOOK_DROPBOX_APP_KEY } = require('./.env.js')

build()

async function build() {
  try {
    const startTime = new Date().getTime()
    await cleanDist()
    const ejsTemplates = await buildEjsTemplates()
    const assets = await buildWebpack(ejsTemplates)
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

async function buildWebpack(ejsTemplates) {
  log('Building webpack assets')
  const config = webpackConfig({ dropboxAppKey: FITBOOK_DROPBOX_APP_KEY, ejsTemplates })
  const stats = (await promisify(webpack)(config)).toJson()
  if (stats.errors.length > 0) {
    throw new Error(stats.errors[0])
  }
  stats.warnings.forEach((warning) => {
    log(`Webpack warning: ${warning}`)
  })
  return stats.assetsByChunkName
}

async function buildIcons() {
  log('Building SVG icons')
  const files = await promisify(glob)(path.join(__dirname, 'app/icons/*.svg'))
  return Promise.all(files.map((file) => fsp.readFile(file, 'utf8'))).then((svgFiles) => {
    return svgFiles.map((svg, index) => insertIconIdInSvg(files[index], svg)).join('\n')
  })
}

function insertIconIdInSvg(filePath, svg) {
  const fileName = filePath.match(/([a-z0-9_]+)\.svg$/)
  return svg.replace('<svg ', `<svg id="svg-${fileName[1]}" `)
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
