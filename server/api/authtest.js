/*
Authenticate User
 */

import { OAuth2Client } from  'google-auth-library'

async function verifyGoogleIdentityToken (token) {
  const oauthClient = new OAuth2Client()
  const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  // const userId = payload['sub']  // Unique user ID, string. Use as primary key; don't use email as that may change.
  // console.log(userId)

  return payload
}

export default async function api_auth (clientRequest, serverResponse) {
  try {
    const auth = clientRequest.get('Authorization')
    const userToken = auth?.match(/(^Bearer )(.*)/)?.[2]
    const userData = await verifyGoogleIdentityToken(userToken)
    
    serverResponse
    .status(200)
    .json({
      status: 'ok',
      message: 'User authenticated',
      debugRequestBody: clientRequest.body,
      debugGooglePayload: userData,
    })

  } catch (err) {

    console.error(err)

    serverResponse
    .status(401)
    .json({
      status: 'error',
      message: 'User not authorised',
    })

  }
}
