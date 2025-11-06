import './style.css'
import decodeJWT from './util/decodeJWT.js'

function $ (arg) {
  return document.querySelector(arg)
}

class WebApp {
  constructor () {
    this.userToken = undefined

    this.doSignOut = this.doSignOut.bind(this)

    $('#signout-button').addEventListener('click', this.doSignOut)
  }

  // Starts the app, once the window has fully loaded.
  // - Triggered by window.onload.
  start () {
    console.log('start()')
    this.update()
    this.checkAuth()
  }

  // Check if user is currently authenticated, by confirming with the server.
  // - Triggered when the app starts (to check if the user "has previously
  //   signed in", aka has an existing JWT saved in localStorage) and when
  //   the "sign in" action successfully completes.
  async checkAuth () {
    console.log('checkAuth()')

    try {
      const userToken = localStorage?.getItem('userToken')  || ''
      this.userToken = userToken

      // Hey server, can you please confirm that user X with token Y is who
      // they say they are?
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Authorization': userToken ? `Bearer ${userToken}` : undefined,
          'Content-Type': 'application/json',
        },
      })

      // If we don't get a 200 response, user isn't authenticated properly.
      if (res.status !== 200) throw new Error(`/api/auth returned ${res.status}`)

      // If we get a 200 response, we can confirm that user is legit.
      this.update()

    } catch (err) {

      console.error(err)
      this.doSignOut()

    }
  }

  // Handles successful sign in event.
  // - `token` is a JSON Web Token (jwt) provided by Google, from the
  //   "sign in" event, which contains
  // - Triggered by Sign In With Google's callback.
  // - This token will be saved to local storage
  onSignIn (token) {
    // Sanity check: if there's no token, sign out.
    if (!token) return this.doSignOut()
    
    // Debug
    const userInfo = decodeJWT(token)
    console.log('onSignIn(), userInfo: ', userInfo)

    // Save user token (JWT)
    localStorage?.setItem('userToken', token)
    this.userToken = token
    
    // Ask server to confirm that user is legit.
    this.checkAuth()
  }

  // Signs out the current user.
  doSignOut () {
    console.log('doSignOut()')
    localStorage?.removeItem('userToken')
    this.userToken = undefined

    this.update()
  }

  // Updates the webpage to match the app status.
  update () {
    console.log('update()')

    // Update header
    const userToken = this.userToken
    const userInfo = decodeJWT(userToken)
    console.log('userInfo: ', userInfo)

    if (userToken) {

      $('#signout-button').style.display = 'block'
      $('.g_id_signin').style.display = 'none'

      $('#user-details').style.display = 'block'
      $('#user-details').innerHTML = `Signed in as ${userInfo?.name || '???'}`

    } else {

      $('#signout-button').style.display = 'none'
      $('.g_id_signin').style.display = 'block'

      $('#user-details').style.display = 'none'
      $('#user-details').innerHTML = ''

    }
  }
}

window.webapp = new WebApp()

window.onload = function init () {
  window.webapp.start()
}
