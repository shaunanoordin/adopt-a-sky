import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import decodeJWT from './util/decodeJWT.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))

class WebApp {
  constructor () {
    console.log('+++ WebApp.constructor()')
  }

  start () {
    console.log('+++ WebApp.start()')
    this.checkAuth()
  }

  // Check if user is currently authenticated, by confirming with the server.
  async checkAuth () {

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        foo: 'bar'
      }),
    })

    const resBody = await res.json()
    console.log('+++ resBody: ', resBody)
  }

  onSignIn (token) {
    const userInfo = decodeJWT(token)
    console.log('+++ userInfo: ', userInfo)
    
    this.checkAuth()

    // TODO
  }

  doSignOut () {
    // TODO
  }
}

window.webapp = new WebApp()

window.onload = function init () {
  window.webapp.start()
}
