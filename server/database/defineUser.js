import { DataTypes } from 'sequelize'

export default function defineUser (sequelize) {
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