/*
Authenticate User
 */

import decodeJWT from '../../src/util/decodeJWT.js'

export default async function api_test (clientRequest, serverResponse) {
  try {
    console.log('+++ START')
    const auth = clientRequest.get('Authorization')
    const userToken = auth?.match(/(^Bearer )(.*)/)?.[2]
    console.log(userToken)
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
