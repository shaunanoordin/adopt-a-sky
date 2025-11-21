/*
Endpoing for checking user authentication.
- And by "is the user authenticated?", we really mean "is the JWToken sent in
  the HTTP Authorization header legit?" 
- Returns 200 (plus user data) if the user is authenticated.
- Returns 401 if the user isn't.
- Relies on checkAuth to do the actual work, and assumes that checkAuth was run
  before this function. 
*/

import connectDatabase from '../database/connectDatabase.js'
import defineUser from '../database/defineUser.js'
import { config } from '../config.js'

export default async function api_adopt (clientRequest, serverResponse) {
  try {
    const {
      userAuthenticated,
      userId,
    } = serverResponse.locals

    if (userAuthenticated) {

      const sequelize = connectDatabase()
      const User = defineUser(sequelize)
      let user = await User.findByPk(userId)
      if (!user) { throw new Error('User somehow does not exist in the database. This should be impossible.') }

      const ra = parseFloat(clientRequest.body.ra)
      const dec = parseFloat(clientRequest.body.dec)
      
      // Sanity check
      if (isNaN(ra) || isNaN(dec)) { throw new Error('Invalid input') }
      if (!(0 <= ra && ra <= 360) || !(-90 <= dec && dec <= 90)) { throw new Error('Invalid input') }

      let status = ''
      let message = ''
      if (user.patch_adopted) {

        status = 'noop'
        message = 'Patch already adopted'

      } else {

        user.set({
          patch_adopted: true,
          patch_ra: ra,
          patch_dec: dec,
          patch_radius: config.defaultRadiusInDegrees,
        })
        await user.save()

        status = 'ok'
        message = 'Patch adopted'

      }
      
      serverResponse
      .status(200)
      .json({
        status,
        message,
        user,
      })

    } else {

      serverResponse
      .status(401)
      .json({
        status: 'error',
        message: 'User not authenticated',
      })

    }

  } catch (err) {

    console.error(err)

    serverResponse
    .status(500)
    .json({
      status: 'error',
      message: err?.toString?.() || 'Unknown error',
    })

  }
}
