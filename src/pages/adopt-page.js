/*
Adoption Page
Allows a user to adopt a patch of sky.
Only valid if user is logged in, and has NOT yet adopted a patch of sky.
 */

import { $ } from '../util/html.js'

export default class AdoptPage {
  constructor (app) {
    this.app = app

    this.posting = false

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

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'

    } else if (this.app.userData?.patch_adopted) {
      $('#adopted-section').style.display = 'block'

    } else {
      $('#adoption-section').style.display = 'block'
    }
  }

  async doAdoption (event) {
    event.preventDefault?.()

    if (this.posting) { return }
    this.posting = true
    $('#adoption-form button[type=submit]').disabled = true
    $('#adoption-form .status').innerText = 'Adopting...'

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
        $('#adoption-form .status').innerText = 'Adoption complete!'
      } else if (resJson.status === 'noop') {
        $('#adoption-form .status').innerText = 'You\'ve already adopted a patch of sky.'
      }

      this.app.userData = resJson.user
      this.update()

    } catch (err) {

      console.error(err)
      $('#adoption-form .status').innerText = `ERROR ${err}`

    } finally {
      this.posting = false
      $('#adoption-form button[type=submit]').disabled = false
    }
  }
}