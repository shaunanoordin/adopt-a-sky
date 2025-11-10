import './style.css'
import decodeJWT from './util/decodeJWT.js'
import Aladin from 'aladin-lite'

function $ (arg) {
  return document.querySelector(arg)
}

function $create (arg) {
  return document.createElement(arg)
}

class WebApp {
  constructor () {
    // JSON Web Token.
    // - Contains user details.
    // - This is the "stamp of approval" received from Google upon successfully
    //   signing in.
    // - We also store this in localStorage.
    this.userToken = undefined

    // Determines if we know if the user is legit.
    // - True if EITHER checkAuth() has confirmed user is legit OR user is
    //   signed out.
    // - False when user has just loaded the app, OR the user has just started
    //   the sign in process.
    // - Used to see when it's safe to serve user-related features.
    this.userChecked = false

    this.skyMap = null

    // Bind functions and event handlers.
    this.doSignOut = this.doSignOut.bind(this)
    $('#signout-button').addEventListener('click', this.doSignOut)
  }

  // Starts the app, once the window has fully loaded.
  // - Triggered by window.onload.
  // - Initiates the "do I have a legit user?" check.
  start () {
    console.log('start()')
    this.startSkyMap()
    this.update()
    this.checkAuth()
  }

  startSkyMap () {
    console.log('startSkyMap()')
    try {
      $('#sky-map').style.width = '100%'
      $('#sky-map').style.height = '400px'
      this.skyMap = Aladin.aladin('#sky-map', {
        fov: 360,
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

  // Check if user is currently authenticated, by confirming with the server.
  // - Triggered when the app starts (to check if the user "has previously
  //   signed in", aka has an existing JWT saved in localStorage) and when
  //   the "sign in" action successfully completes.
  // - One way or another, will set userChecked = true once checks are done.
  async checkAuth () {
    console.log('checkAuth()')

    try {
      const userToken = localStorage?.getItem('userToken')
      this.userToken = userToken

      // If there's no user token, let's not bother asking.
      if (!userToken) return this.doSignOut()

      // Hey server, can you please confirm that user X with token Y is who
      // they say they are?
      const res = await fetch('/api/auth', {
        // method: 'GET',
        headers: {
          'Authorization': userToken ? `Bearer ${userToken}` : undefined,
          'Content-Type': 'application/json',
        },
      })

      // Indicate that we've successfully checked if the user is legit. 
      this.userChecked = true

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

    // Save user token (JWT)
    localStorage?.setItem('userToken', token)
    this.userToken = token
    
    // Ask server to confirm that user is legit.
    this.userChecked = false
    this.checkAuth()
  }

  // Signs out the current user.
  doSignOut () {
    console.log('doSignOut()')
    localStorage?.removeItem('userToken')
    this.userToken = undefined
    this.userChecked = true  // We've signed out the user, so we know for sure we DON'T have a user.

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

    this.debugGetUsers()
  }

  async debugGetUsers () {
    // Update debug information
    const htmlDebug = $('#debug')
    const htmlList = $create('ul')
    while (htmlDebug.firstChild) { htmlDebug.removeChild(htmlDebug.firstChild) }
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
}

window.webapp = new WebApp()

window.onload = function init () {
  window.webapp.start()
}
