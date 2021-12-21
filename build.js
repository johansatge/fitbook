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

const startTime = new Date().getTime()
cleanDist()
  .then(buildEjsTemplates)
  .then((ejsTemplates) => {
    return Promise.all([buildWebpack(ejsTemplates), buildIcons()])
  })
  .then(([assets, icons]) => {
    return Promise.all([renderIndexHtml({ assets, icons }), renderLoginHtml({ assets })])
  })
  .then(() => {
    const endTime = new Date().getTime()
    log(`Done in ${endTime - startTime}ms`)
  })
  .catch((error) => {
    log(`An error occurred (${error})`)
  })

async function cleanDist() {
  log(`Cleaning ${distDir}`)
  try {
    await fsp.rm(distDir, { recursive: true })
  } catch (error) {
    // nothing
  }
  await fsp.mkdir(distDir, { recursive: true })
}

function buildEjsTemplates() {
  log('Building EJS templates')
  return Promise.all([buildEjsTemplate('app/feed.ejs'), buildEjsTemplate('app/add.ejs')]).then(([feed, add]) => {
    return { feed, add }
  })
}

function buildEjsTemplate(templatePath) {
  return fsp.readFile(templatePath, 'utf8').then((contents) => {
    const compiled = ejs.compile(contents, {
      client: true,
      compileDebug: false,
      strict: true,
      localsName: 'data',
    })
    return compiled.toString()
  })
}

function buildWebpack(ejsTemplates) {
  log('Building webpack assets')
  const config = webpackConfig({ dropboxAppKey: FITBOOK_DROPBOX_APP_KEY, ejsTemplates })
  return promisify(webpack)(config).then((stats) => {
    stats = stats.toJson()
    if (stats.errors.length > 0) {
      throw new Error(stats.errors[0])
    }
    stats.warnings.forEach((warning) => {
      log(`Webpack warning: ${warning}`)
    })
    return stats.assetsByChunkName
  })
}

function buildIcons() {
  log('Building SVG icons')
  return promisify(glob)(path.join(__dirname, 'app/icons/*.svg')).then((files) => {
    return Promise.all(files.map((file) => fsp.readFile(file, 'utf8'))).then((svgFiles) => {
      return svgFiles.map((svg, index) => insertIconIdInSvg(files[index], svg)).join('\n')
    })
  })
}

function insertIconIdInSvg(filePath, svg) {
  const fileName = filePath.match(/([a-z0-9_]+)\.svg$/)
  return svg.replace('<svg ', `<svg id="svg-${fileName[1]}" `)
}

function renderIndexHtml({ assets, icons }) {
  log('Rendering HTML (index)')
  return fsp.readFile(path.join(__dirname, 'app/index.ejs'), 'utf8').then((ejsTemplate) => {
    const html = ejs.render(ejsTemplate, {
      assets,
      icons,
      appTitle: pkg.name,
      appTitleFull: `${pkg.name} ${pkg.version}`,
    })
    return fsp.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
  })
}

function renderLoginHtml({ assets }) {
  log('Rendering HTML (login)')
  return fsp.readFile(path.join(__dirname, 'app/login.ejs'), 'utf8').then((ejsTemplate) => {
    const html = ejs.render(ejsTemplate, {
      assets,
      appTitle: pkg.name,
      appTitleFull: `${pkg.name} ${pkg.version}`,
      dropboxAppKey: FITBOOK_DROPBOX_APP_KEY,
    })
    return fsp.writeFile(path.join(distDir, 'login.html'), html, 'utf8')
  })
}

function log(message) {
  console.log(message) // eslint-disable-line no-console
}
