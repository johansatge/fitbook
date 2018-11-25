const argv = require('yargs').argv
const autoprefixer = require('autoprefixer')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = ({ dropboxAppKey }) => {
  return {
    mode: argv.dev ? 'development' : 'production',
    entry: {
      app: path.join(__dirname, 'app.js'),
      styles: path.join(__dirname, 'styles.scss'),
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
          test: /\.jsx?$/,
          include: [__dirname],
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
              // [
              //   'babel-plugin-jsx-pragmatic',
              //   {
              //     module: 'preact',
              //     import: 'h',
              //     export: 'h',
              //   },
              // ],
            ],
          },
        },
        {
          test: /\.scss$/,
          include: [__dirname],
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: 'css-loader' },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [autoprefixer()],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [path.join(__dirname, '..', 'node_modules'), path.join(__dirname, 'components')],
                outputStyle: 'compressed',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        DROPBOX_APP_KEY: JSON.stringify(dropboxAppKey),
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[chunkhash].css',
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: argv.dev ? 'static' : 'disabled',
        reportFilename: path.join(__dirname, '../.dist/bundle.analyze.html'),
        openAnalyzer: false,
      }),
    ],
  }
}
