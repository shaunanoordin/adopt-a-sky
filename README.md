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
