import dotenv from 'dotenv'

dotenv.config()

export const config = {
  origins: process.env.ORIGINS || 'https://localhost:3666;https://local.example.com:3666',
  port: process.env.PORT || 3666,
  lasairApiKey: process.env.LASAIR_API_KEY || '',
  lasairApiUrl: process.env.LASAIR_API_URL || 'https://lasair-ztf.lsst.ac.uk/api/',
  databaseHost: process.env.DATABASE_HOST || 'localhost',
  databaseDbname: process.env.DATABASE_DBNAME || '',
  databaseUsername: process.env.DATABASE_USERNAME || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
}
