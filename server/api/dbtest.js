import { Sequelize } from 'sequelize'
import { config } from '../config.js'

export default async function api_test (clientRequest, serverResponse) {
  try {

    // const sequelize = new Sequelize(`postgres://${config.databaseUsername}:${config.databasePassword}@localhost:5432/${config.databaseDbname}`)
    const sequelize = new Sequelize(config.databaseDbname, config.databaseUsername, config.databasePassword, {
      host: 'localhost',
      dialect: 'postgres'
    })

    await sequelize.authenticate()
    sequelize.close()

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