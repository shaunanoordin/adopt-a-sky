import { Sequelize, DataTypes } from 'sequelize'
import { config } from '../config.js'

function defineUser (sequelize) {
  if (!sequelize) return

  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      email: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      patch_ra: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      patch_dec: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      patch_radius: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
    }
  )
  return User
}

export default async function api_dbtest2 (clientRequest, serverResponse) {
  try {

    // const sequelize = new Sequelize(`postgres://${config.databaseUsername}:${config.databasePassword}@localhost:5432/${config.databaseDbname}`)
    const sequelize = new Sequelize(config.databaseDbname, config.databaseUsername, config.databasePassword, {
      host: config.databaseHost,
      dialect: 'postgres'
    })

    const User = defineUser(sequelize)
    await sequelize.sync()

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