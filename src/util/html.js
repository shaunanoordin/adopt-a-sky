/*
HTML Helpers For Lazy Devs
Because I don't want to type document.querySelection every time.
 */

export function $ (arg) {
  return document.querySelector(arg)
}

export function $create (arg) {
  return document.createElement(arg)
}
