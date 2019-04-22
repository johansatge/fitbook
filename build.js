/* global Promise */

require('dotenv').config()

const ejs = require('ejs')
const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const pkg = require('./package.json')
const promisify = require('util').promisify
const webpack = require('webpack')
const webpackConfig = require('./app/webpack.config.js')

const distDir = path.join(__dirname, '.dist')

const startTime = new Date().getTime()
cleanDist()
  .then(buildEjsTemplates)
  .then((ejsTemplates) => {
    return Promise.all([buildWebpack(ejsTemplates), buildIcons()])
  })
  .then(renderHtml)
  .then(() => {
    const endTime = new Date().getTime()
    log(`Done in ${endTime - startTime}ms`)
  })
  .catch((error) => {
    log(`An error occurred (${error.message})`)
  })

function cleanDist() {
  log(`Cleaning ${distDir}`)
  return fs.emptyDir(distDir)
}

function buildEjsTemplates() {
  log('Building EJS templates')
  return fs.readFile('app/feed.ejs', 'utf8').then((feedTemplate) => {
    const feed = ejs.compile(feedTemplate, {
      client: true,
      compileDebug: false,
      strict: true,
      localsName: 'data',
    })
    return { feed: feed.toString() }
  })
}

function buildWebpack(ejsTemplates) {
  log('Building webpack assets')
  const config = webpackConfig({ dropboxAppKey: process.env.FITBOOK_DROPBOX_APP_KEY, ejsTemplates })
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
    return Promise.all(files.map((file) => fs.readFile(file, 'utf8'))).then((svgFiles) => {
      return svgFiles.map((svg, index) => insertIconIdInSvg(files[index], svg)).join('\n')
    })
  })
}

function insertIconIdInSvg(filePath, svg) {
  const fileName = filePath.match(/([a-z0-9_]+)\.svg$/)
  return svg.replace('<svg ', `<svg id="svg-${fileName[1]}" `)
}

function renderHtml([assets, icons]) {
  log('Rendering HTML')
  return fs.readFile(path.join(__dirname, 'app/index.ejs'), 'utf8').then((ejsTemplate) => {
    const html = ejs.render(ejsTemplate, {
      assets,
      icons,
      appTitle: pkg.name,
      appTitleFull: `${pkg.name} ${pkg.version}`,
    })
    return fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
  })
}

function log(message) {
  console.log(message) // eslint-disable-line no-console
}
