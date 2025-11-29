/*
HTML Helpers For Lazy Devs
Because I don't want to type document.querySelection every time.
 */

export function $ (query) {
  return document.querySelector(query)
}

/*
Creates a new element matching the query, and appends it to a parent element 
if any). query has to include the element name, and may optionally include
one #id and/or multiple .classNames.
- Examples of query: "div", or "div#id.class1.class2"
 */
export function $create (query, parent = null) {
  const queryBits = query.match(/([#\.])?([^#\.]+)/g)
  const eleName = queryBits.find(i => i[0] !== '#' && i[0] !== '.')
  const eleId = queryBits.find(i => i[0] === '#')?.substr(1)
  const eleClass = queryBits.filter(i => i[0 ]=== '.').map(i => i.substr(1)).join(' ')

  if (!eleName) { return undefined }

  const ele = document.createElement(eleName)
  if (eleId) { ele.id = eleId }
  if (eleClass) { ele.className = eleClass }
  if (parent) { parent.appendChild(ele) }

  return ele
}
