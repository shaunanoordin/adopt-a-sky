/*
Gets the current date as a Modified Julian Date (JMD), or converts a given date
to a Modified Julian Date.
 */

export default function getModifiedJulianDate (date = new Date()) {
  // Get time since Unix epoch (1 January 1970 00:00:00 UTC)
  const millisecondsSinceEpoch = date.getTime()
  const daysSinceEpoch = millisecondsSinceEpoch / (1000 * 60 * 60 * 24)
  
  // Unix epoch is Julian Date 2440587.5
  // Modified Julian Date is a flat modifier to Julian Date.
  const julianDate = daysSinceEpoch + 2440587.5  
  const modifiedJulianDate = julianDate - 2400000.5
  
  return modifiedJulianDate
}