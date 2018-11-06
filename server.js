const express = require('express')
const path = require('path')

const app = express()
const port = 4000

app.use('/', express.static(path.join(__dirname, '.dist')))

app.listen(port, () => {
  console.log(`http://localhost:${port}`) // eslint-disable-line no-console
})
