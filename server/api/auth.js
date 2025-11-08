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

export default async function api_auth (clientRequest, serverResponse) {
  try {
    const {
      userAuthenticated,
      userEmail,
      userId,
      userName,
    } = serverResponse.locals

    if (userAuthenticated) {

      // TEST: insert user into database
      // --------
      const sequelize = connectDatabase()
      const User = defineUser(sequelize)
      let user = await User.findByPk(userId)
      if (!user) {
        user = await User.create({
          id: userId,
          name: userName,
          email: userEmail,
        })
        console.log(`➕ Created new user: ${user.id}, ${user.name}, ${user.email}`)
      } else {
        console.log(`🟰 User already exists: ${user.id}, ${user.name}, ${user.email}`)
      }
      // --------
      
      serverResponse
      .status(200)
      .json({
        status: 'ok',
        message: 'User authenticated',
        user: {
          id: userId,
          email: userEmail,
          name: userName,
        },
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
      message: 'Unknown error',
    })

  }
}
