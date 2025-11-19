/*
Adoption Page
Allows a user to adopt a patch of sky.
Only valid if user is logged in, and has NOT yet adopted a patch of sky.
 */

import { $ } from '../util/html.js'

export default class AdoptPage {
  constructor (app) {
    this.app = app

    // Bind functions and event handlers.
    // TODO
  }

  start () {}

  update () {
    // const okToContinue = this.doRedirectsIfNecessary()
    // if (!okToContinue) { return }

    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#adopted-section').style.display = 'none'
    $('#adoption-section').style.display = 'none'

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'
      return
    } else if (this.app.userData?.patch_adopted) {
      $('#adopted-section').style.display = 'block'
      return
    }

    $('#adoption-section').style.display = 'block'
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
}