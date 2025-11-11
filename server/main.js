import express from 'express'
import https from 'https'
import selfsigned from 'selfsigned'

import connectDatabase from './database/connectDatabase.js'
import defineUser from './database/defineUser.js'

import { config } from './config.js'
import checkAuth from './checkAuth.js'

import api_auth from './api/auth.js'
import api_skydata from './api/skydata.js'
import api_authtest from './api/authtest.js'
import api_test from './api/test.js'
import api_dbtest from './api/dbtest.js'
import api_dbtest2 from './api/dbtest2.js'
import api_users from './api/users.js'

const server = express()

// Allow server to read JSON payloads
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

// API paths
server.all('/api/{*any}', checkAuth)  // Check user auth before every API call.
server.get('/api/auth', api_auth)
server.get('/api/skydata', api_skydata)

// API test paths
server.get('/api/authtest', api_authtest)
server.get('/api/test', api_test)
server.get('/api/dbtest', api_dbtest)
server.get('/api/dbtest2', api_dbtest2)
server.get('/api/users', api_users)

// All other paths: serve static files
server.use(express.static('dist'))

// Prepare database
const sequelize = connectDatabase()
defineUser(sequelize)
await sequelize.sync()

if (process.env.NODE_ENV === 'production') {
  server.listen(config.port, (err) => {
    if (err) throw err
    console.log(`Server running at port ${config.port}`)
  })
} else {
  const attrs = [{ name: 'commonName', value: 'adopt-a-sky localhost:3666' }]
  const { cert, private: key } = selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048  // A large key size is required for Node 24+
  })
  https.createServer({ cert, key }, server)
    .listen(config.port, (err) => {
      if (err) throw err
      console.log(`Staging Server running at port ${config.port}`)
    })
}
