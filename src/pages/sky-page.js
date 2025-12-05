/*
Sky Viewer Page
Displays the sky map and shows what's happening in the adopted patch of sky.
- Only valid if user is logged in, and HAS adopted a patch of sky.
- Otherwise, directs users to login, or to the Adopt Page.
 */

import Aladin from 'aladin-lite'
import { $, $create } from '../util/html.js'
import { SHERLOCK_TYPES } from '../util/sherlockTypes.js'

const MAX_RESULTS_PER_QUERY = 10

export default class SkyPage {
  constructor (app) {
    this.app = app
    this.skyMap = null
    this.skyDataStatus = 'ready'

    // Bind functions and event handlers.
    this.skyControls_onSubmit = this.skyControls_onSubmit.bind(this)
    $('#sky-controls').addEventListener('submit', this.skyControls_onSubmit)

    this.skyControlsInput_onChange = this.skyControlsInput_onChange.bind(this)
    $('#sky-controls input[name=minDaysAgo]').addEventListener('change', this.skyControlsInput_onChange)
    $('#sky-controls input[name=maxDaysAgo]').addEventListener('change', this.skyControlsInput_onChange)
  }

  skyControls_onSubmit (event) {
    event?.preventDefault()

    // Get data!
    const {
      patch_ra,
      patch_dec,
      patch_radius
    } = this.app.userData
    const minDaysAgo = parseInt($('#sky-controls input[name=minDaysAgo]').value)
    const maxDaysAgo = parseInt($('#sky-controls input[name=maxDaysAgo]').value)
    
    this.getSkyData(patch_ra, patch_dec, patch_radius, minDaysAgo, maxDaysAgo)

    // Recentre sky map
    this.skyMap.gotoRaDec(patch_ra, patch_dec)
    this.skyMap.setFoV(patch_radius)
  }

  skyControlsInput_onChange (event) {
    const SMALLEST_PERIOD = 7
    const name = event?.target.name
    let value = parseInt(event?.target.value) || 0
    value = Math.max(value, 0)
    
    const htmlMinDaysAgo = $('#sky-controls input[name=minDaysAgo]')
    const htmlMaxDaysAgo = $('#sky-controls input[name=maxDaysAgo]')

    switch (name) {
      case 'minDaysAgo':
        const maxDaysAgo = parseInt(htmlMaxDaysAgo.value) || 0
        htmlMinDaysAgo.value = value
        htmlMaxDaysAgo.value = Math.max(maxDaysAgo, value + SMALLEST_PERIOD)
        break
      
      case 'maxDaysAgo':
        value = Math.max(value, SMALLEST_PERIOD)
        const minDaysAgo = parseInt(htmlMinDaysAgo.value) || 0
        htmlMinDaysAgo.value = Math.min(minDaysAgo, value - SMALLEST_PERIOD)
        htmlMaxDaysAgo.value = value
        break
    }

  }

  // Starts the page, once the window has fully loaded.
  // - Triggered by WebApp.start()
  start () {
    console.log('page.start()')
    this.update()
  }

  // Updates the HTML document to match the app's state.
  // - Triggered by the parent WebApp's update().
  // - Triggered by the Page's start().
  // - Triggered after a SUCCESSFUL adoption action. (See doAdoption()).
  // - Also see updateDataStatus().
  // - IF the user is logged in and has adopted a patch of sky, then this will
  //   also trigger startSkyMap() AND an initial getSkyData() data fetch.
  update () {
    console.log('page.update()')

    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#unadopted-section').style.display = 'none'
    $('#sky-section').style.display = 'none'
    if (!this.app.userChecked) { return }

    // Switch between one of 3 states:
    // - user hasn't logged in.
    // - logged-in user hasn't adopted patch.
    // - logged-in user has adopted patch.

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'
      return
    } else if (!this.app.userData?.patch_adopted) {
      $('#unadopted-section').style.display = 'block'
      return
    }

    // For the Sky Page, the "logged-in user has adopted patch" state is the
    // MAIN state.
    $('#sky-section').style.display = 'block'

    // Get data!
    const {
      patch_ra,
      patch_dec,
      patch_radius
    } = this.app.userData
    const minDaysAgo = parseInt($('#sky-controls input[name=minDaysAgo]').value)
    const maxDaysAgo = parseInt($('#sky-controls input[name=maxDaysAgo]').value)
    this.startSkyMap(patch_ra, patch_dec, patch_radius)
    this.getSkyData(patch_ra, patch_dec, patch_radius, minDaysAgo, maxDaysAgo)

    // Update info section.
    $('#sky-info').innerHTML = `<p>Your patch of sky is centred around the coordinates RA = <b>${patch_ra?.toFixed?.(4)}&deg;</b> dec = <b>${patch_dec?.toFixed?.(4)}&deg</b>, with a radius of <b>${(patch_radius * 3600)?.toFixed(0)} arcseconds</b>.</p>`
  }

  // Sets the status of the data get/post/whatever action AND updates the HTML
  // elements displaying said status accordingly.
  // - Triggered only by the getSkyData() action.
  updateDataStatus (status = '', message = '', args = {}) {
    const htmlDataStatus = $('#sky-data-status')
    htmlDataStatus.innerText = ''
    htmlDataStatus.className = 'data-status'

    this.skyDataStatus = status

    switch (status) {
      case 'fetching':
        htmlDataStatus.innerText = 'Checking what\'s available in this patch of the sky...'
        htmlDataStatus.className = 'data-status status-fetching'
        break
      case 'success':
        const extraMessage = (args?.count >= MAX_RESULTS_PER_QUERY)
          ? `(Due to the amount of data, we can only show ${MAX_RESULTS_PER_QUERY} items at a time, and they're not displayed in any particular order. You could narrow your time span to possibly find more results.)`
          : ''
        htmlDataStatus.innerText = `Here\'s what we found! ${extraMessage}`
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

  // Adds the Aladin Lite-powered Sky Map to the page.
  // - Only makes sense if a Sky Map hasn't been previously initialised.
  startSkyMap (ra, dec, radiusInDegrees) {
    console.log('startSkyMap()')

    try {
      if (!this.skyMap) {

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

        console.log('Sky Map started.')

      } else {

        console.log('Sky Map already exists!')

      }

      // Go to the coordinates of the adopted patch of sky
      this.skyMap.gotoRaDec(ra, dec)
      this.skyMap.setFoV(radiusInDegrees)

    } catch (err) {
      console.error(err)
    }
  }

  // Fetches data about the specified patch of sky.
  // - If the fetch action is successful and has data, the data is populated on
  //   the HTML page as "trading cards".
  // - If a fetch action is currently ongoing, this function will not trigger
  //   another one.
  async getSkyData (ra, dec, radiusInDegrees, minDaysAgo, maxDaysAgo) {
    const htmlSkyData = $('#sky-data')

    if (this.skyDataStatus === 'fetching') {
      const htmlDataStatus = $('#sky-data-status')
      htmlDataStatus.innerText = 'Please wait, we\'re still checking.'
      htmlDataStatus.className = 'data-status status-busy'
      return
    }

    try {
      this.updateDataStatus('fetching')
      htmlSkyData.innerHTML = ''

      const searchQuery = new URLSearchParams({ ra, dec, radiusInDegrees, minDaysAgo, maxDaysAgo })
      const res = await fetch(`/api/skydata?${searchQuery}`)
      if (res.status !== 200) { throw new Error('Could not fetch data.') }
      const resJson = await res.json()
      const data = resJson?.data || []

      data.forEach(item => {
        const htmlLI = $create('li.datacard', htmlSkyData)
        htmlLI.className = 'datacard'
        
        const htmlTitle = $create('h4.datacard-title', htmlLI)
        htmlTitle.innerText = item.objectId

        const htmlArt = $create('div.datacard-art', htmlLI)

        const htmlType = $create('div.datacard-type', htmlLI)
        htmlType.innerText = SHERLOCK_TYPES[item.sherlock] ? `${item.sherlock} - ${SHERLOCK_TYPES[item.sherlock]}` : SHERLOCK_TYPES['']

        // ❗️ WARNING: DANGER ZONE
        // We need to purify the HTML here.
        const htmlBody = $create('div.datacard-body', htmlLI)
        htmlBody.innerHTML = `
          <p>This was found <b>${item.days_ago.toFixed(0)} days ago</b> at coordinates <b>RA=${item.ramean.toFixed(4)}</b> and <b>dec=${item.decmean.toFixed(4)}</b></p>
          <p>${item.description}</p>
        `
      })

      if (data.length === 0) {
        this.updateDataStatus('no-data')
      } else {
        this.updateDataStatus('success', '', { count: data.length })
      }

    } catch (err) {
      console.error(err)
      this.updateDataStatus('error', err)
      htmlSkyData.innerHTML = ``
    }
  }
}