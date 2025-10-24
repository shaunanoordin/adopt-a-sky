import express from 'express'
import https from 'https'
import selfsigned from 'selfsigned'

import { config } from './config.js'
import api_test from './api/test.js'

const server = express()

function checkOrigin (req, res, next) {
  const origin = req.get('origin') || ''
  console.log('Request from: ', origin)
  next()
}

// Apply origin checks
server.use(checkOrigin)

// Special API path
server.get('/api/test', api_test)

// All other paths: serve static files
server.use(express.static('dist'))

if (process.env.NODE_ENV === 'production') {
  server.listen(config.port, (err) => {
    if (err) throw err
    console.log(`Server running at port ${config.port}`)
    console.log(`Acceptable origins: ${config.origins.split(';')}`)
  })
} else {
  const attrs = [{ name: 'commonName', value: 'local.example.com' }]
  const { cert, private: key } = selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048  // A large key size is required for Node 24+
  })
  https.createServer({ cert, key }, server)
    .listen(config.port, (err) => {
      if (err) throw err
      console.log(`Staging Server running at port ${config.port}`)
      console.log(`Acceptable origins: ${config.origins.split(';')}`)
    })
}
