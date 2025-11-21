import dotenv from 'dotenv'

dotenv.config()

const DEFAULT_RADIUS_IN_ARCSECONDS = 500  // This is pretty arbitrary.

export const config = {
  port: process.env.PORT || 3666,
  lasairApiKey: process.env.LASAIR_API_KEY || '',
  lasairApiUrl: process.env.LASAIR_API_URL || 'https://lasair-ztf.lsst.ac.uk/api/',
  databaseHost: process.env.DATABASE_HOST || 'localhost',
  databaseDbname: process.env.DATABASE_DBNAME || '',
  databaseUsername: process.env.DATABASE_USERNAME || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleAuthIssuer: 'https://accounts.google.com',
  defaultRadiusInDegrees: DEFAULT_RADIUS_IN_ARCSECONDS / 3600,
  maxResultsPerQuery: 10,
}
