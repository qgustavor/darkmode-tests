const getDarkMode = () => new Promise((resolve, reject) => {
  const openRequest = indexedDB.open('darkmode', 1)
  openRequest.onsuccess = function() {
    const request = openRequest.result
      .transaction(['settings'], 'readwrite')
      .objectStore('settings')
      .get('darkmode')

    request.onsuccess = function () {
      resolve(request.result ? request.result.value : undefined)
    }
    request.onerror = d => reject(Error(d))
  }
  openRequest.onerror = d => reject(Error(d))
  openRequest.onupgradeneeded = (d) => {
    const store = d.target.result.createObjectStore('settings', {
      keyPath: 'name'
    })
    store.createIndex('name', 'name', { unique: true })
    store.createIndex('value', 'value', { unique: false })
  }
})

oninstall = () => {
  console.log('Installed')
}

onfetch = event => {
  event.respondWith(async function () {
    const [darkMode, response] = await Promise.all([
      getDarkMode(),
      fetch(event.request)
    ])
    if (!response.headers.get('content-type').includes('text/html')) return response

    const data = await response.text()
    const newData = data.replace('<html>', '<html class="dark-mode-' + darkMode + '">')

    return new Response(newData, response)
  }())
}
