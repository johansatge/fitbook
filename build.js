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
  .then(() => {
    return Promise.all([buildWebpack(), buildIcons()])
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

function buildWebpack() {
  log('Building webpack assets')
  return new Promise((resolve, reject) => {
    const config = webpackConfig({ dropboxAppKey: process.env.FITBOOK_DROPBOX_APP_KEY })
    webpack(config, (error, stats) => {
      if (error) {
        return reject(error)
      }
      stats = stats.toJson()
      if (stats.errors.length > 0) {
        return reject(new Error(stats.errors[0]))
      }
      stats.warnings.forEach((warning) => {
        log(`Webpack warning: ${warning}`)
      })
      // @todo cleaner? & delete js file
      stats.assetsByChunkName.styles = stats.assetsByChunkName.styles.shift()
      resolve(stats.assetsByChunkName)
    })
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
  const fileName = filePath.match(/([a-z_]+)\.svg$/)
  return svg.replace('<svg ', `<svg id="svg-${fileName[1]}" `)
}

function renderHtml([assets, icons]) {
  log('Rendering HTML')
  return fs.readFile(path.join(__dirname, 'app/index.ejs'), 'utf8').then((ejsTemplate) => {
    const html = ejs.render(ejsTemplate, { assets, icons, htmlTitle: pkg.name })
    return fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
  })
}

function log(message) {
  console.log(message) // eslint-disable-line no-console
}
