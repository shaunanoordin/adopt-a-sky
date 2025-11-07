/*
Connects to the Database. Returns a Sequelize connection.
 */

import { Sequelize } from 'sequelize'
import { config } from '../config.js'

export default function connectDatabase () {
  try {
    // const sequelize = new Sequelize(`postgres://${config.databaseUsername}:${config.databasePassword}@localhost:5432/${config.databaseDbname}`)
    const sequelize = new Sequelize(config.databaseDbname, config.databaseUsername, config.databasePassword, {
      host: config.databaseHost,
      dialect: 'postgres'
    })

    return sequelize

  } catch (err) {

    console.error(err)
    return undefined

  }
}