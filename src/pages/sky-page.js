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
    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#unadopted-section').style.display = 'none'
    $('#sky-section').style.display = 'none'
    if (!this.app.userChecked) { return }

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
    $('#sky-info').innerHTML = `<p>Your patch of sky is centred around the coordinates RA = <b>${patch_ra?.toFixed?.(4)}&deg;</b> dec = <b>${patch_dec?.toFixed?.(4)}&deg</b>, with a radius of <b>${(patch_radius * 3600)?.toFixed(0)} arcseconds</b>.</p>`
  }

  startSkyMap (ra, dec, radiusInDegrees) {
    console.log('startSkyMap()')

    try {
      if (this.skyMap) { throw new Error('SkyMap already started') }

      $('#sky-map').style.width = '100%'
      $('#sky-map').style.height = '400px'

      // Prepare the sky map!
      this.skyMap = Aladin.aladin('#sky-map', {
        // Main config
        fov: radiusInDegrees,  // Field of view
        // survey: 'CDS/P/Rubin/FirstLook',  // Visualisation data. If blank, this defaults to 'P/DSS2/color'

        // Misc controls
        showCooGridControl: true,
        showGoToControl: false,
        showProjectionControl: false,
        showReticle: false,
      })

      // Go to the coordinates of the adopted patch of sky
      this.skyMap.gotoRaDec(ra, dec)

    } catch (err) {
      console.error(err)
    }
  }

  async getSkyData (ra, dec, radiusInDegrees) {
    const htmlSkyData = $('#sky-data')

    try {
      this.setDataStatus('fetching')
      htmlSkyData.innerHTML = ''

      const searchQuery = new URLSearchParams({ ra, dec, radiusInDegrees })
      const res = await fetch(`/api/skydata?${searchQuery}`)
      if (res.status !== 200) { throw new Error('Could not fetch data') }
      const resJson = await res.json()
      const data = resJson?.data || []

      data.forEach(item => {
        const htmlLI = $create('li')
        htmlLI.innerText = `Object: ${item.objectId}`
        htmlSkyData.appendChild(htmlLI)
      })

      if (data.length === 0) {
        this.setDataStatus('no-data')
      } else {
        this.setDataStatus('success')
      }

    } catch (err) {
      console.error(err)
      this.setDataStatus('error', err)
      htmlSkyData.innerHTML = ``
    }
  }

  setDataStatus (status = '', message = '') {
    const htmlDataStatus = $('#sky-data-status')
    htmlDataStatus.innerText = ''
    htmlDataStatus.className = 'data-status'

    switch (status) {
      case 'fetching':
        htmlDataStatus.innerText = 'Checking what\'s available in this patch of the sky...'
        htmlDataStatus.className = 'data-status status-fetching'
        break
      case 'success':
        htmlDataStatus.innerText = 'Here\'s what\'s been found!'
        htmlDataStatus.className = 'data-status status-success'
        break
      case 'no-data':
        htmlDataStatus.innerText = 'Sorry, nothing has been found in this patch of sky, for the given time span. Try changing the time span.'
        htmlDataStatus.className = 'data-status status-no-data'
        break
      case 'error':
        htmlDataStatus.innerText = `ERROR: ${message}`
        htmlDataStatus.className = 'data-status status-error'
        break
    }
  }
}