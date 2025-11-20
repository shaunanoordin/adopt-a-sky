/*
Sky Viewer Page
Displays the sky map and shows what's happening in the adopted patch of sky.
Only valid if user is logged in, and has adopted a patch of sky.
 */

import Aladin from 'aladin-lite'
import { $, $create } from '../util/html.js'

export default class SkyPage {
  constructor (app) {
    this.app = app
    this.skyMap = null
  }

  start () {
    this.update()
  }

  update () {
    // const okToContinue = this.doRedirectsIfNecessary()
    // if (!okToContinue) { return }

    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#unadopted-section').style.display = 'none'
    $('#sky-section').style.display = 'none'

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'
      return
    } else if (!this.app.userData?.patch_adopted) {
      $('#unadopted-section').style.display = 'block'
      return
    }

    $('#sky-section').style.display = 'block'

    const {
      patch_ra,
      patch_dec,
      patch_radius
    } = this.app.userData
    this.startSkyMap(patch_ra, patch_dec, patch_radius)
    this.getSkyData(patch_ra, patch_dec, patch_radius)
  }

  // Redirect users to other pages, if necessary.
  // Returns true if no redirects are performed, but to be honest, the
  // window.location change should pretty much terminate the code execution. 
  doRedirectsIfNecessary () {

    // If user is logged in and HAS adopted a patch, redirect them to the
    // sky page
    if (
      this.app.userData?.patch_adopted === true
    ) {
      window.location = '/view/sky'
      return false
    }

    return true
  }

  startSkyMap (ra, dec, radiusInDegrees) {
    console.log('startSkyMap()')

    try {
      if (this.skyMap) { throw new Error('SkyMap already started') }

      $('#sky-map').style.width = '100%'
      $('#sky-map').style.height = '400px'

      this.skyMap = Aladin.aladin('#sky-map', {
        fov: radiusInDegrees,
        projection: 'AIT',
        cooFrame: 'equatorial',
        showCooGridControl: true,
        showSimbadPointerControl: true,
        showCooGrid: true
      })
      this.skyMap.gotoRaDec(ra, dec)

    } catch (err) {
      console.error(err)
    }
  }

  async getSkyData (ra, dec, radiusInDegrees) {
    const htmlSkyData = $('#sky-data')

    try {
      htmlSkyData.innerHTML = '<li class="info message">Checking what\'s available in this patch of sky...</>'

      const searchQuery = new URLSearchParams({ ra, dec, radiusInDegrees })
      const res = await fetch(`/api/skydata?${searchQuery}`)
      if (res.status !== 200) { throw new Error('Could not fetch data') }
      const resJson = await res.json()
      const data = resJson?.data || []

      htmlSkyData.innerHTML = ``
      data.forEach(item => {
        const htmlLI = $create('li')
        htmlLI.innerText = `Object: ${item.object}`
        htmlSkyData.appendChild(htmlLI)
      })
      if (data.length === 0) {
        htmlSkyData.innerHTML = `<li class="info message">Nothing has been found in this patch of sky</li>`
      }

    } catch (err) {
      console.error(err)
      htmlSkyData.innerHTML = `<li class="error message">ERROR: ${err}</li>`
    }
  }
}