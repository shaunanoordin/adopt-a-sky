/*
Index Page
Project home page. Directs users to the appropriate pages of interest.
 */

import { $ } from '../util/html.js'

export default class IndexPage {
  constructor (app) {
    this.app = app
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
  update () {
    console.log('page.update()')

    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#unadopted-section').style.display = 'none'
    $('#adopted-section').style.display = 'none'
    if (!this.app.userChecked) { return }

    // Switch between one of 3 states:
    // - user hasn't logged in.
    // - logged-in user hasn't adopted patch.
    // - logged-in user has adopted patch.

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'

    } else if (!this.app.userData?.patch_adopted) {
      $('#unadopted-section').style.display = 'block'

    } else {
      $('#adopted-section').style.display = 'block'
    }
  }
}