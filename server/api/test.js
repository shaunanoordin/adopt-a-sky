import { config } from '../config.js'

export default async function api_test (clientRequest, serverResponse) {
  try {
    const ra = 194.494
    const dec = 48.851
    const radius = 500.0

    const lasairResponse = await fetch(`${config.lasairApiUrl}cone/?ra=${ra}&dec=${dec}&radius=${radius}&requestType=all&token=${config.lasairApiKey}&format=json`)
    if (lasairResponse.status !== 200) throw new Error(`Lasair response error, status ${lasairResponse.status}`)
    const data = await lasairResponse.json()
    const processedData = []

    for (let i = 0; i < data.length; i++) {
      const obj = data[i]
      let classifications = {}
      
      const SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD = 1
      if (i <= SANITY_LIMIT_TO_PREVENT_API_CALL_OVERLOAD) {
        try {
          const sherlockResponse = await fetch(`${config.lasairApiUrl}sherlock/object/?objectId=${obj.object}&lite=true&token=${config.lasairApiKey}&format=json`)
          if (sherlockResponse.status !== 200) throw new Error(`Lasair Sherlock response error, status ${lasairResponse.status}`)
          const sherlockData = await sherlockResponse.json()
          console.log('+'.repeat(40), '\n', sherlockData)
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