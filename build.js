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

const srcDir = path.join(__dirname, 'src')
const distDir = path.join(__dirname, '.dist')

const isWatching = process.argv.includes('--watch')
build()
if (isWatching) {
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
    const jsFilename = await buildJs()
    const cssFilename = await buildCss()
    const iconsSvg = await buildIcons()
    await buildHtml({ jsFilename, cssFilename, iconsSvg })
    await fsp.copyFile(path.join(__dirname, '_headers'), path.join(distDir, '_headers'))
    const endTime = new Date().getTime()
    console.log(`Done in ${endTime - startTime}ms`)
  } catch (error) {
    console.log(error.message)
    console.log(error.stack)
    if (!isWatching) {
      process.exit(1)
    }
  }
}

async function cleanDist() {
  console.log(`Cleaning ${distDir}`)
  try {
    await fsp.rm(distDir, { recursive: true })
  } catch (error) {
    // nothing
  }
  await fsp.mkdir(distDir, { recursive: true })
}

async function buildJs() {
  console.log('Building JS assets')
  const result = await esbuild.build({
    entryPoints: [path.join(srcDir, 'jsx/index.jsx')],
    bundle: true,
    minify: true,
    entryNames: '[name].[hash]',
    outdir: distDir,
    metafile: true,
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    external: ['crypto', 'util'], // Dropbox is using these for Node compat
  })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0])
  }
  const assets = Object.keys(result.metafile.outputs)
  return path.parse(assets[0]).base
}

async function buildHtml({ jsFilename, cssFilename, iconsSvg }) {
  console.log('Building HTML')
  let html = await fsp.readFile(path.join(srcDir, 'index.html'), 'utf8')
  html = html.replaceAll('__appTitle__', pkg.name)
  html = html.replaceAll('__appTitleFull__', `${pkg.name} ${pkg.version}`)
  html = html.replaceAll('__jsFilename__', jsFilename)
  html = html.replaceAll('__cssFilename__', cssFilename)
  html = html.replaceAll('__iconsSvg__', iconsSvg)
  html = html.replaceAll('__dropboxAppKey__', process.env.FITBOOK_DROPBOX_APP_KEY)
  await fsp.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
}

async function buildCss() {
  console.log('Building CSS assets')
  const files = [
    'vars',
    'reset',
    'initialloader',
    'button',
    'navbar',
    'floatingbutton',
    'feed',
    'footer',
    'login',
    'addoverlay',
    'menuoverlay',
    'stopwatchoverlay',
    'toast',
  ]
  let css = ''
  for (const file of files) {
    const contents = await fsp.readFile(path.join(srcDir, `css/${file}.css`), 'utf8')
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
  console.log('Building SVG icons')
  const iconsPath = path.join(srcDir, 'icons')
  const files = (await fsp.readdir(iconsPath)).filter((file) => file.endsWith('.svg'))
  const svgs = []
  for (const file of files) {
    const svg = await fsp.readFile(path.join(iconsPath, file), 'utf8')
    svgs.push(svg.replace('<svg ', `<svg id="svg-${path.parse(file).name}" `))
  }
  return svgs.join('\n')
}
