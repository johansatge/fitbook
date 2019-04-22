const compression = require('compression')
const express = require('express')
const path = require('path')

const app = express()
const port = 4000

app.use(compression())
app.use((request, response, next) => {
  response.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  next()
})
app.use('/', express.static(path.join(__dirname, '.dist')))

app.listen(port, () => {
  console.log(`http://localhost:${port}`) // eslint-disable-line no-console
})
