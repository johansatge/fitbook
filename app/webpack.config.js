const argv = require('yargs').argv
const autoprefixer = require('autoprefixer')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')

class MiniCssExtractPluginCleaner {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MiniCssExtractPluginCleaner', (compilation, callback) => {
      const cssAssets = Object.keys(compilation.assets).filter((asset) => asset.match(/\.css$/))
      Object.keys(compilation.assets).forEach((asset) => {
        if (!asset.match(/\.css$/) && cssAssets.includes(asset.replace(/\.js$/, '.css'))) {
          delete compilation.assets[asset]
        }
      })
      callback()
    })
  }
}

module.exports = ({ dropboxAppKey, ejsTemplates }) => {
  const defines = {
    __DROPBOX_APP_KEY__: JSON.stringify(dropboxAppKey),
  }
  Object.keys(ejsTemplates).forEach((templateName) => {
    defines[`__EJS_${templateName.toUpperCase()}__`] = ejsTemplates[templateName]
  })
  return {
    mode: argv.dev ? 'none' : 'production',
    entry: {
      index: path.join(__dirname, 'index.js'),
      login: path.join(__dirname, 'login.js'),
      styles: path.join(__dirname, 'styles/styles.css'),
    },
    output: {
      path: path.join(__dirname, '../.dist'),
      filename: '[name].[chunkhash].js',
      library: ['Scripts', '[name]'],
      libraryTarget: 'var',
    },
    performance: {
      maxEntrypointSize: 500000,
      maxAssetSize: 500000,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [__dirname],
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        {
          test: /\.css$/,
          include: [__dirname],
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: 'css-loader' },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        // materialize: path.resolve(__dirname, '..', 'node_modules/materialize-css/dist/js/materialize.js'),
      },
    },
    plugins: [
      new webpack.DefinePlugin(defines),
      new MiniCssExtractPlugin({
        filename: '[name].[chunkhash].css',
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: argv.dev ? 'static' : 'disabled',
        reportFilename: path.join(__dirname, '../.dist/bundle.analyze.html'),
        openAnalyzer: false,
        logLevel: 'silent',
      }),
      new MiniCssExtractPluginCleaner(),
    ],
  }
}
