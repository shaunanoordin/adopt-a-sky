import { config } from '../config.js'
import getModifiedJulianDate from '../../src/util/getModifiedJulianDate.js'

export default async function api_skydata (clientRequest, serverResponse) {
  try {
    // Get user input.
    let ra = parseFloat(clientRequest.query.ra)
    let dec = parseFloat(clientRequest.query.dec)
    let radiusInDegrees = (parseFloat(clientRequest.query.radius))
      ? parseFloat(clientRequest.query.radius)
      : config.defaultRadiusInDegrees
    let minDaysAgo = (clientRequest.query.minDaysAgo !== undefined) ? parseInt(clientRequest.query.minDaysAgo) : 0 
    let maxDaysAgo = (clientRequest.query.maxDaysAgo !== undefined) ? parseInt(clientRequest.query.maxDaysAgo) : 365
    
    // Arbitrary input
    const minimumLightCurveDetection = 5

    // Sanity check
    if (isNaN(ra) || isNaN(dec)) { throw new Error('Invalid input') }
    if (!(0 <= ra && ra <= 360) || !(-90 <= dec && dec <= 90)) { throw new Error('Invalid input') }
    if (isNaN(minDaysAgo) || isNaN(maxDaysAgo)) { throw new Error('Invalid input') }
    if (!(0 < radiusInDegrees <= 1)) { throw new Error('Invalid input') }  // This limit is arbitrary, we just don't want to scan the whole sky

    // Prepare to construct the query.
    const raMin = ra - radiusInDegrees
    const raMax = ra + radiusInDegrees  // WARNING: this doesn't account when ra is close to 0º, or to 360º, but ah well, we're not trying to be too precise.
    const decMin = dec - radiusInDegrees
    const decMax = dec + radiusInDegrees
    let querySelect = ''
    let queryTables = ''
    let queryWhere = ''
    const queryLimit = config.maxResultsPerQuery

    if (config.lasairApiSchema === 'ztf') {
      querySelect = encodeURIComponent(`objects.objectId,objects.ramean AS 'ra', objects.decmean AS 'dec',objects.gmag, objects.rmag,jdnow() - objects.jdmax AS 'days_ago',sherlock_classifications.classification AS 'sherlock',sherlock_classifications.z,sherlock_classifications.photoZ,sherlock_classifications.catalogue_object_id,sherlock_classifications.description`)
      queryTables = encodeURIComponent(`objects,sherlock_classifications`)
      queryWhere = encodeURIComponent(`objects.ncand >= ${minimumLightCurveDetection} AND jdnow() -jdmax BETWEEN ${minDaysAgo} AND ${maxDaysAgo} AND ramean BETWEEN ${raMin} AND ${raMax} AND decmean BETWEEN ${decMin} AND ${decMax}`)

    } else if (config.lasairApiSchema === 'lsst') {
      // ❗️ LSST does NOT allow jdnow() function to be called. Hence, we need to craft our own before/until times.
      const mjdNow = getModifiedJulianDate()
      const mjdMax = mjdNow - maxDaysAgo
      const mjdMin = mjdNow - minDaysAgo

      querySelect = encodeURIComponent(`objects.diaObjectId as objectId, objects.ra, objects.decl AS 'dec', objects.lastDiaSourceMjdTai AS 'most_recent_mjdate', sherlock_classifications.classification AS 'sherlock', sherlock_classifications.description`)
      queryTables = encodeURIComponent('objects,sherlock_classifications')
      queryWhere = encodeURIComponent(`lastDiaSourceMjdTai BETWEEN ${mjdMax} AND ${mjdMin} AND ra BETWEEN ${raMin} AND ${raMax} AND decl BETWEEN ${decMin} AND ${decMax}`)
    }

    // Fetch data from Lasair's "Query" API.
    const lasairResponse = await fetch(`${config.lasairApiUrl}query/?selected=${querySelect}&tables=${queryTables}&conditions=${queryWhere}&limit=${queryLimit}&token=${config.lasairApiKey}&format=json`)
    if (lasairResponse.status !== 200) throw new Error(`Lasair response error, status ${lasairResponse.status}`)
    const data = await lasairResponse.json()

    // Return response to user.
    serverResponse
    .status(200)
    .json({
      status: 'ok',
      data,
    })

  } catch (err) {
    const errMessage = err?.toString() || '???'

    serverResponse
    .status(500)
    .json({
      error: errMessage,
    })
  }
}
