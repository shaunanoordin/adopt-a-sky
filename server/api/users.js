import connectDatabase from '../database/connectDatabase.js'
import defineUser from '../database/defineUser.js'

export default async function api_users (clientRequest, serverResponse) {
  try {
    // TEST: list all users

    const sequelize = connectDatabase()
    const User = defineUser(sequelize)

    const users = await User.findAll()
    const usersData = users.map(itm => ({
      id: itm.id.substr(0, 8) + '***',
      name: itm.name.substr(0, 8) + '***',
    }))

    serverResponse
    .status(200)
    .json({
      status: 'ok',
      users: usersData,
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
