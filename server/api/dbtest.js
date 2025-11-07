import { config } from '../config.js'

export default async function api_test (clientRequest, serverResponse) {
  try {
    
    serverResponse
    .status(200)
    .json({
      status: 'ok'
    })

  } catch (err) {
    const errMessage = err?.toString() || '???'

    serverResponse
    .status(500)
    .json({
      status: 'error',
      error: errMessage
    })
  }
}