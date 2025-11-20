/*
Checks if user is correctly Authenticated, and updates the 
- This function gets the JWT (JSON Web Token, provided to the user by Google)
  from the HTTP request's Authorization header.
- This JWT is verified with Google using the OAuth2Client.
- The result is is saved in the response.object's .locals 
- This function is meant to be used in the Express server's routing:
    expressServer.all('/path', checkAuth)
    expressServer.all('/path', someOtherFunctionThatRequiresAuth)
 */

import { OAuth2Client } from  'google-auth-library'
import { config } from './config.js'

async function verifyGoogleIdentityToken (token) {
  const oauthClient = new OAuth2Client()
  const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
  })
  const payload = ticket.getPayload()
  return payload
}

export default async function checkAuth (clientRequest, serverResponse, next) {

  serverResponse.locals.userAuthenticated = false
  serverResponse.locals.userId = ''
  serverResponse.locals.userName = ''
  serverResponse.locals.userEmail = ''

  try {
    const auth = clientRequest.get('Authorization')
    const userToken = auth?.match(/(^Bearer )(.*)/)?.[2]
    const userData = await verifyGoogleIdentityToken(userToken)

    // Auth: Do we need to confirm the following?
    // --------
    // const issuer = userData['iss']
    // const audience = userData['aud']
    // if (issuer !== config.googleAuthIssuer
    //     || audience !== config.googleClientId
    // ) {
    //   throw new Error('')
    // }
    // --------

    serverResponse.locals.userAuthenticated = true
    serverResponse.locals.userId = userData['sub']  // This is a unique string of numbers.
    serverResponse.locals.userName = userData['name']
    serverResponse.locals.userEmail = userData['email']
  
  } catch (err) {
    // User isn't authenticated.
  }

  next()
}