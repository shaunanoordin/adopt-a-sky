import express from 'express'
import https from 'https'
import selfsigned from 'selfsigned'
import dotenv from 'dotenv'

dotenv.config()

const server = express()

const config = {
  origins: process.env.ORIGINS || 'https://localhost:3666;https://local.example.com:3666',
  port: process.env.PORT || 3666,
  lasairApiKey: process.env.LASAIR_API_KEY || '',
  lasairApiUrl: process.env.LASAIR_API_URL || 'https://lasair-ztf.lsst.ac.uk/api/'
}

function checkOrigin (req, res, next) {
  const origin = req.get('origin') || ''
  console.log('Request from: ', origin)
  next()
}

async function testRoot (clientRequest, serverResponse) {
  try {
    serverResponse
    .status(200)
    .json({
      status: 'OK'
    })

  } catch (err) {
    const errMessage = err?.toString() || '???'
    serverResponse
    .status(500)
    .json({
      error: errMessage
    })
  }
}

async function testFetch (clientRequest, serverResponse) {
  try {
    const ra = 194.494
    const dec = 48.851
    const radius = 500.0

    const lasairResponse = await fetch(`${config.lasairApiUrl}cone/?ra=${ra}&dec=${dec}&radius=${radius}&requestType=all&token=${config.lasairApiKey}&format=json`)
    if (lasairResponse.status !== 200) throw new Error(`Lasair response error, status ${lasairResponse.status}`)
    const data = await lasairResponse.json()
    const processedData = []

    for (let i = 0; i < data.length; i++) {
      const obj = data[i]
      let classifications = {}
      
      const SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD = 5
      if (i <= SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD) {
        try {
          const sherlockResponse = await fetch(`${config.lasairApiUrl}sherlock/object/?objectId=${obj.object}&lite=true&token=${config.lasairApiKey}&format=json`)
          if (sherlockResponse.status !== 200) throw new Error(`Lasair Sherlock response error, status ${lasairResponse.status}`)
          const sherlockData = await sherlockResponse.json()
          console.log('+'.repeat(40), '\n', sherlockData)
          classifications = sherlockData?.classifications || {}

        } catch (err) {
          // TODO
          console.error(err)
        }
      }
      
      processedData.push({
        ...obj,
        classifications
      })
    }

    serverResponse
    .status(200)
    .json({
      status: 'OK',
      data: processedData
    })

  } catch (err) {
    const errMessage = err?.toString() || '???'

    serverResponse
    .status(500)
    .json({
      error: errMessage
    })
  }
}

server.use(checkOrigin)
server.get('/', testRoot)
server.get('/fetch', testFetch)

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
