import connectDatabase from '../database/connectDatabase.js'
import defineUser from '../database/defineUser.js'

export default async function api_users (clientRequest, serverResponse) {
  try {
    // TEST: list all users

    const sequelize = connectDatabase()
    const User = defineUser(sequelize)

    const users = await User.findAll()
    const data = users.map(itm => ({
      id: itm.id,
      name: itm.name,
    }))

    serverResponse
    .status(200)
    .json({
      status: 'ok',
      data,
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
