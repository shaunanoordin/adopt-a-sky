import { config } from '../config.js'

export default async function api_skydata (clientRequest, serverResponse) {
  try {
    // Get user input.
    let ra = parseFloat(clientRequest.query.ra)
    let dec = parseFloat(clientRequest.query.dec)
    let radius = (parseFloat(clientRequest.query.radius))
      ? parseFloat(clientRequest.query.radius) * 3600 // Convert radius (degrees) to radius (arcseconds)
      : 500

    if (isNaN(ra) || isNaN(dec)) { throw new Error('Invalid input') }
    // TODO: check if ra & dec are within correct bounds of degrees

    // Optional: Truncate input for sanity.
    ra = ra.toFixed(4)
    dec = dec.toFixed(4)
    radius = radius.toFixed(0)

    // Fetch data from Lasair's "Cone Search" API.
    const lasairResponse = await fetch(`${config.lasairApiUrl}cone/?ra=${ra}&dec=${dec}&radius=${radius}&requestType=all&token=${config.lasairApiKey}&format=json`)
    if (lasairResponse.status !== 200) throw new Error(`Lasair response error, status ${lasairResponse.status}`)
    const data = await lasairResponse.json()
    
    // Convert data from Lasair into more refined, process data.
    const processedData = []
    for (let i = 0; i < data.length; i++) {
      const obj = data[i]
      let classifications = {}
      
      const SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD = 0
      if (i <= SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD) {
        try {
          const sherlockResponse = await fetch(`${config.lasairApiUrl}sherlock/object/?objectId=${obj.object}&lite=true&token=${config.lasairApiKey}&format=json`)
          if (sherlockResponse.status !== 200) throw new Error(`Lasair Sherlock response error, status ${lasairResponse.status}`)
          const sherlockData = await sherlockResponse.json()
          classifications = sherlockData?.classifications || {}

        } catch (err) {
          // TODO
          console.error(err)
        }
      }
      
      processedData.push({
        ...obj,
        classifications
      })
    }

    // Return response to user.
    serverResponse
    .status(200)
    .json({
      status: 'ok',
      data: processedData
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