/*
Adoption Page
Allows a user to adopt a patch of sky.
- Only useful if user is logged in, and has NOT yet adopted a patch of sky.
- Otherwise, directs users to login, or to the Sky Page.
 */

import { $, $all } from '../util/html.js'
import constellationsJson from '../util/constellations.json'

const constellations = constellationsJson.constellations

export default class AdoptPage {

  /*
  General Functions
  ------------------------------------------------------------------------------
   */

  constructor (app) {
    this.app = app
    this.adoptDataStatus = 'ready'

    // Bind functions and event handlers: Selection form
    $('#selection-form').addEventListener('submit', this.doNothing)
    
    this.showSelectionPanel = this.showSelectionPanel.bind(this)
    $all('#selection-form ul li button').forEach(button => button.addEventListener('click', this.showSelectionPanel))

    this.doSelectionRandom = this.doSelectionRandom.bind(this)
    $('#selection-button-random').addEventListener('click', this.doSelectionRandom)

    // Bind functions and event handlers: Adoption form
    this.doAdoption = this.doAdoption.bind(this)
    $('#adoption-form').addEventListener('submit', this.doAdoption)
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
  update () {
    console.log('page.update()')

    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#adopted-section').style.display = 'none'
    $('#adoption-section').style.display = 'none'
    if (!this.app.userChecked) { return }

    // Switch between one of 3 states:
    // - user hasn't logged in.
    // - logged-in user hasn't adopted patch.
    // - logged-in user has adopted patch.
    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'

    } else if (this.app.userData?.patch_adopted) {
      $('#adopted-section').style.display = 'block'

    } else {
      $('#adoption-section').style.display = 'block'
    }

    // For the Adopt Page, the "logged-in user hasn't adopted patch" state is
    // the MAIN state, but most of the action is performed via the HTML forms,
    // so there's little follow up action required here.
  }

  // Stop the event from doing anything.
  doNothing (event) {
    event.preventDefault()
  }

  /*
  Selection Form
  ------------------------------------------------------------------------------
   */

  // Open one of the Selection Form's panels.
  showSelectionPanel (event) {
    const selectionType = event.currentTarget.dataset.type

    // Hide all panels except for the selected one.
    $all('#selection-form .panel').forEach(panel => panel.style.display = 'none')
    $(`#selection-form .panel[data-type=${selectionType}]`).style.display = 'block'

    switch (selectionType) {
      case 'constellation':
        this.updateConstellationPanel()
        break;
    }
  }

  /*
  Selection Form - "Random" Selection Method
  ------------------------------------------------------------------------------
   */

  // Select a random RA and dec, and then pass it to the Adoption Form.
  doSelectionRandom (event) {

    // Roll the dice!
    const randomRa = (Math.random() * 360).toFixed(4)  // Valid RA ranger: 0º to 360º
    const randomDec = (Math.random() * 180 - 90).toFixed(4)  // Valid dec range: -90º South to +90º North

    // Pass the values to the Adoption Form.
    $('input[name="ra"]').value = randomRa
    $('input[name="dec"]').value = randomDec 
    this.showAdoptionForm()
  }

  /*
  Selection Form - "Constellation" Selection Method
  ------------------------------------------------------------------------------
   */

  // Render the Selection Form's panel for Constellation Selection
  updateConstellationPanel () {

  }

  doSelectionConstellation () {

  }

  /*
  Adoption Form
  ------------------------------------------------------------------------------
   */

  // Show the Adoption Form and hide the Selection Form.
  showAdoptionForm () {
    $('#selection-form').style.display = 'none'
    $('#adoption-form').style.display = 'block'
  }

  // Submit adoption details (RA, dec) to the API!
  async doAdoption (event) {
    event?.preventDefault()

    if (this.adoptDataStatus === 'posting') { return }
    this.updateDataStatus('posting')

    try {

      const ra = parseFloat($('input[name="ra"]')?.value) || 0.0
      const dec = parseFloat($('input[name="dec"]')?.value) || 0.0

      const userToken = this.app.userToken
      const res = await fetch('/api/adopt', {
        method: 'POST',
        headers: {
          'Authorization': userToken ? `Bearer ${userToken}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ra, dec })
      })

      if (res.status !== 200) { throw new Error('Could not perform adoption.') }

      const resJson = await res.json()

      if (resJson.status === 'ok') {
        this.updateDataStatus('success')
      } else if (resJson.status === 'noop') {
        this.updateDataStatus('no-op')
      }

      this.app.userData = resJson.user
      this.update()

    } catch (err) {

      console.error(err)
      this.updateDataStatus('error', err)

    }
  }

  // Sets the status of the data get/post/whatever action AND updates the HTML
  // elements displaying said status accordingly.
  // - Triggered only by the doAdoption() action.
  // - The Adopt Page's .data-status element has '.conditional' by default, so
  //   it's hidden until the "adopt" action is triggered. 
  updateDataStatus (status = '', message = '', args = {}) {
    const htmlDataStatus = $('#adoption-data-status')
    const htmlSubmitButton = $('#adoption-form button[type=submit]')

    htmlDataStatus.innerText = ''
    htmlDataStatus.className = 'data-status'

    this.adoptDataStatus = status

    switch (status) {
      case 'posting':
        htmlDataStatus.innerText = 'Adopting...'
        htmlDataStatus.className = 'data-status status-posting'
        htmlSubmitButton.disabled = true
        break
      case 'success':
        htmlDataStatus.innerText = 'Adoption complete!'
        htmlDataStatus.className = 'data-status status-success'
        htmlSubmitButton.disabled = true
        break
      case 'no-op':
        htmlDataStatus.innerText = 'You\'ve already adopted a patch of sky.'
        htmlDataStatus.className = 'data-status status-no-op'
        htmlSubmitButton.disabled = true
        break
      case 'error':
        htmlDataStatus.innerText = `ERROR: ${message}`
        htmlDataStatus.className = 'data-status status-error'
        htmlSubmitButton.disabled = false
        break
    }
  }
}