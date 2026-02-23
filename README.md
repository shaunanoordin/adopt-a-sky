# Adopt-A-Sky

Adopt-A-Sky is a web app where users can 'adopt' patches of the southern sky. Uses data from the [Vera C. Rubin Observatory](https://rubinobservatory.org/)

- It works like this:
  - a user signs in to website.
  - using a selection criteria, the user is assigned a patch of sky (ra, dec, radius)
  - when a user visits (and revisits) the website, they see events, objects, and/or discoveries in their patch of sky. (Querying data from Lasair)
- Target audience: laypeople with even a small interest in astronomy.
- Goals: present astronomical information in an engaging manner. Get people invested in their patches of sky. Get people to want to learn more (e.g. by going to Lasair).
- Current dev hosting: https://adopt-a-sky.onrender.com/ (it takes a while to boot up because it's free hostin')
- Dev repo: https://github.com/shaunanoordin/adopt-a-sky


## Additional Reading

Sign In with Google:
- "Sign In with Google" is used for user registration.
  - **DO NOT CONFUSE IT WITH "GOOGLE SIGN IN"**
  - Dev Overview: https://developers.google.com/identity/gsi/web/guides/overview
  - Tutorial: https://codelabs.developers.google.com/codelabs/sign-in-with-google-button#0
- If you're morbidly curious, the deprecated "Google Sign In" docs are here: https://developers.google.com/identity/sign-in/web/sign-in

Lasair:
- The Lasair platform acts as a data source for finding interesting observations from observatories. 
- There are two flavours of Lasair - Lasair ZTF and Lasair LSST (Rubin) - each pulling & compiling observations from different observatories.
- Lasair LSST (Rubin) is the intended source of data, but it doesn't have any data/content as of 
  - Website: https://lasair-lsst.lsst.ac.uk/
  - Docs: https://lasair-lsst.readthedocs.io/en/main/
- Lasair ZTF is used for development, as it actually has data/content.
  - Website: https://lasair-ztf.lsst.ac.uk/
  - Docs: https://lasair.readthedocs.io/

Aladin Lite:
- Aladin Lite is used for displaying a map of the sky. It's Google Map/Leaflet/OpenLayers, but for astronomers.
  - API reference: https://aladin.cds.unistra.fr/AladinLite/doc/API/


## Dev Notes & TODO

- Selecting a patch of sky
  - Revisit Astrology idea
  - re: selecting by type of observation - galactic plane is dusty so no supernovas can be observed here?

- Getting data
  - Cone search orders results by NEAREST.
  - Ordering by "most recently found" will result in crap results. Astronomy results gets better after a while.
  - Supernovae aren't always supernovae in Sherlock
  - .jd is Julian Date, the date the object was """discovered"""(?)

- Additional Features
  - Favourites system for bookmarking objects

- Dark Sorcery: Constellations
  - Converting a set of coordinates to a matching constellation is easy.
  - Converting a constellation to a set of valid coordinates is more difficult, if we want to be accurate.
  - This is because constellations occupy an irregular space in the sky.
  - A good enough conversion is to use the "centre" of each constellation (using the mean of the North-most + South-most RA boundaries and the mean of East-most + West-most declination boundaries) and finding coordinates around there.
  - Don't ask me about Serpens (which is a constellation in two parts)
  - Don't ask me about constellations drifting over time.

<details>
<summary>Getting Constellations Data</summary>

- Go to https://en.wikipedia.org/wiki/IAU_designated_constellations_by_solid_angle 
- This is the best source I've found so far with a list of all 88 constellations plus their mean RA & mean dec, since a lot of the older IAU webpages that hold the original data are gone.
- In the dev console, add an ID to the constellations table.
- Run the magical incantation below:

```
Array.from(document.querySelectorAll('#add-an-id-to-the-constellations-table tr')).map(tr => {
    cols = Array.from(tr.children).map(td => td.innerText)

    ra = cols[6].split(' ')
    raHours = parseInt(ra[0])
    raMins = parseFloat(ra[1])
    ra_mean = raHours * 360 / 24 + raMins / 60

    dec = cols[7].split(' ')
    decDegs = parseInt(dec[0].replace('−', '-'))
    decMins = parseFloat(dec[1]) * Math.sign(decDegs)
    dec_mean = decDegs + decMins / 60

    return {
        name: cols[2],
        short_name: cols[1],
        ra_mean,
        dec_mean,
        solid_angle_square_degrees: parseFloat(cols[3]),
        solid_angle_stredians: parseFloat(cols[4]) / 1000,
        coverage: cols[5],
        rank_by_coverage: parseInt(cols[0]),
    }
}).sort((a, b) => a.name.localeCompare(b.name))
```

- Convert this to a JSON file.
- There's probably an easier way to get this data, but the dark pact I made with the Elder Gods of JavaScript demand that I take the most maddening route possible. Iä! Iä! Node.js fhtagn!

</details>
