/*
Adoption Page
Allows a user to adopt a patch of sky.
Only valid if user is logged in, and has NOT yet adopted a patch of sky.
 */

import { $ } from '../util/html.js'

export default class AdoptPage {
  constructor (app) {
    this.app = app
    this.adoptDataStatus = 'ready'

    // Bind functions and event handlers.
    this.doAdoption = this.doAdoption.bind(this)
    $('#adoption-form').addEventListener('submit', this.doAdoption)
  }

  start () {
    this.update()
  }

  update () {
    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#adopted-section').style.display = 'none'
    $('#adoption-section').style.display = 'none'
    if (!this.app.userChecked) { return }

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'

    } else if (this.app.userData?.patch_adopted) {
      $('#adopted-section').style.display = 'block'

    } else {
      $('#adoption-section').style.display = 'block'
    }
  }

  async doAdoption (event) {
    event?.preventDefault()


    if (this.adoptDataStatus === 'posting') { return }
    this.setDataStatus('posting')

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

      if (res.status !== 200) { throw new Error(`/api/auth returned ${res.status}`) }

      const resJson = await res.json()

      if (resJson.status === 'ok') {
        this.setDataStatus('success')
      } else if (resJson.status === 'noop') {
        this.setDataStatus('no-op')
      }

      this.app.userData = resJson.user
      this.update()

    } catch (err) {

      console.error(err)
      this.setDataStatus('error', err)

    }
  }

  setDataStatus (status = '', message = '', args = {}) {
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