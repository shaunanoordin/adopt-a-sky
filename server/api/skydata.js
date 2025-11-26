import { config } from '../config.js'

export default async function api_skydata (clientRequest, serverResponse) {
  try {
    // Get user input.
    let ra = parseFloat(clientRequest.query.ra)
    let dec = parseFloat(clientRequest.query.dec)
    let radiusInDegrees = (parseFloat(clientRequest.query.radius))
      ? parseFloat(clientRequest.query.radius)
      : config.defaultRadiusInDegrees
    let minDaysAgo = (clientRequest.query.minDaysAgo !== undefined) ? parseInt(clientRequest.query.minDaysAgo) : 0 
    let maxDaysAgo = (clientRequest.query.maxDaysAgo !== undefined) ? parseInt(clientRequest.query.minDaysAgo) : 365
    
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
    const querySelect = encodeURIComponent(`objects.objectId,objects.ramean, objects.decmean,objects.gmag, objects.rmag,jdnow() - objects.jdmax as 'days_ago',sherlock_classifications.classification as 'sherlock',sherlock_classifications.z,sherlock_classifications.photoZ,sherlock_classifications.catalogue_object_id,sherlock_classifications.description`)
    const queryTables = encodeURIComponent(`objects,sherlock_classifications`)
    const queryWhere = encodeURIComponent(`objects.ncand  >= ${minimumLightCurveDetection} AND jdnow() -jdmax BETWEEN ${minDaysAgo} AND ${maxDaysAgo} AND ramean BETWEEN ${raMin} AND ${raMax} AND decmean BETWEEN ${decMin} AND ${decMax}`)
    const queryLimit = config.maxResultsPerQuery

    // Fetch data from Lasair's "Query" API.
    const lasairResponse = await fetch(`${config.lasairApiUrl}query/?selected=${querySelect}&tables=${queryTables}&conditions=${queryWhere}&limit=${queryLimit}&token=${config.lasairApiKey}&format=json`)
    if (lasairResponse.status !== 200) throw new Error(`Lasair response error, status ${lasairResponse.status}`)
    const data = await lasairResponse.json()

    // Return response to user.
    serverResponse
    .status(200)
    .json({
      status: 'ok',
      data
    })

  } catch (err) {
    const errMessage = err?.toString() || '???'

    serverResponse
    .status(500)
    .json({
      error: errMessage
    })
  }
}