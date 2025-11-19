/*
Debug Page
Displays the sky map and shows what's happening in the adopted patch of sky.
 */

import Aladin from 'aladin-lite'
import { $, $create } from '../util/html.js'

export default class DebugPage {
  constructor (app) {
    this.app = app
    this.skyMap = null

    // Bind functions and event handlers.
    this.doSkyMapDebugControlsUpdate = this.doSkyMapDebugControlsUpdate.bind(this)
    $('#sky-map-debug-controls').addEventListener('submit', this.doSkyMapDebugControlsUpdate)

    this.doSkyMapDebugControlsUpdate = this.doSkyMapDebugControlsUpdate.bind(this)
    $('#sky-map-debug-controls').addEventListener('submit', this.doSkyMapDebugControlsUpdate)
  }

  start () {
    this.startSkyMap()
  }

  startSkyMap () {
    console.log('startSkyMap()')
    try {
      $('#sky-map').style.width = '100%'
      $('#sky-map').style.height = '400px'
      this.skyMap = Aladin.aladin('#sky-map', {
        fov: 500 / 3600,  // Radius of adopted patch, in degrees.
        projection: 'AIT',
        cooFrame: 'equatorial',
        showCooGridControl: true,
        showSimbadPointerControl: true,
        showCooGrid: true
      })
    } catch (err) {
      console.error(err)
    }
  }

  update () {
    // TODO: check for (app.userChecked && app.userData)
    // TODO: check for (app.userData.hasAdopted

    this.debugGetUsers()
  }

    async debugGetUsers () {
    // Update debug information
    const htmlDebug = $('#debug')
    const htmlList = $create('ul')
    htmlDebug.innerHTML = ''
    htmlDebug.appendChild(htmlList)

    const res = await fetch('/api/users')

    if (res.status === 200) {
      const resJson = await res.json()
      const users = resJson.users || []
      
      users.forEach(user => {
        const htmlLI = $create('li')
        htmlLI.style.display = 'flex'
        htmlLI.style.gap = '1em'

        const htmlSpan1 = $create('span')
        htmlSpan1.style.fontWeight = 'bold'
        htmlSpan1.innerText = user.id

        const htmlSpan2 = $create('span')
        htmlSpan2.innerText = user.name

        htmlLI.appendChild(htmlSpan1)
        htmlLI.appendChild(htmlSpan2)
        htmlList.appendChild(htmlLI)
      })

    } else {
      console.error(res.status)
    }
  }

  doSkyMapDebugControlsUpdate (event) {
    event?.preventDefault()

    function getVal (arg) {
      return parseInt($(arg)?.value) || undefined
    }

    const [ curRa, curDec ] = this.skyMap.getRaDec()
    const curRadius = this.skyMap.getFov()

    const ra =  getVal('#sky-map-debug-controls input[name=ra]') ?? curRa
    const dec = getVal('#sky-map-debug-controls input[name=dec]') ?? curDec
    const radius = getVal('#sky-map-debug-controls input[name=radius]') ?? curRadius

    $('#sky-map-debug-controls input[name=ra]').value = ra
    $('#sky-map-debug-controls input[name=dec]').value = dec
    $('#sky-map-debug-controls input[name=radius]').value = radius

    console.log(ra, dec, radius)

    this.skyMap?.gotoRaDec(ra, dec)
    this.getSkyData(ra, dec, radius)
  }

  async getSkyData (ra, dec, radius) {
    const htmlSkyData = $('#sky-data')

    try {
      htmlSkyData.innerHTML = '<li class="info message">Checking what\'s available in this patch of sky...</>'

      const searchQuery = new URLSearchParams({ ra, dec, radius })
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