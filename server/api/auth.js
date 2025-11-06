/*
Authenticate User
 */

import decodeJWT from '../../src/util/decodeJWT.js'
import { OAuth2Client } from  'google-auth-library'

async function verifyGoogleIdentityToken (token) {
  const oauthClient = new OAuth2Client()
  const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  const userId = payload['sub']  // Unique user ID. Use as primary key; don't use email as that may change.

  console.log('+++ verify START')
  console.log(userId)
  console.log('+++ verify END')
}

export default async function api_auth (clientRequest, serverResponse) {
  try {
    console.log('+++ START')
    const auth = clientRequest.get('Authorization')
    const userToken = auth?.match(/(^Bearer )(.*)/)?.[2]
    console.log(userToken)
    console.log('+++ END')

    await verifyGoogleIdentityToken(userToken)
    
    serverResponse
    .status(200)
    .json({
      status: 'OK',
      message: 'User authenticated',
      debugRequestBody: clientRequest.body,
    })

  } catch (err) {

    console.error(err)

    serverResponse
    .status(500)
    .json({
      status: 'error',
      message: 'Unknown error',
    })

  }
}
