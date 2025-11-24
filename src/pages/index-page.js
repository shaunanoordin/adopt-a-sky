/*
Index Page
Project home page. Directs users to the appropriate pages of interest.
 */

import { $ } from '../util/html.js'

export default class IndexPage {
  constructor (app) {
    this.app = app
  }

  start () {
    this.update()
  }

  update () {
    // Reset
    $('#anonymous-section').style.display = 'none'
    $('#unadopted-section').style.display = 'none'
    $('#adopted-section').style.display = 'none'

    if (!this.app.userData) {
      $('#anonymous-section').style.display = 'block'

    } else if (!this.app.userData?.patch_adopted) {
      $('#unadopted-section').style.display = 'block'

    } else {
      $('#adopted-section').style.display = 'block'
    }
  }
}