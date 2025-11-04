/*
Authenticate User
 */

import decodeJWT from '../../src/util/decodeJWT.js'

export default async function api_test (clientRequest, serverResponse) {
  try {
    console.log('+++ START')
    console.log(clientRequest.body)
    console.log('+++ END')

    serverResponse
    .status(200)
    .json({
      status: 'OK',
      message: 'User authenticated',
      debugRequestBody: clientRequest.body,
    })

  } catch (err) {

    serverResponse
    .status(500)
    .json({
      status: 'error',
      message: 'Unknown error',
    })

  }
}
