
const CACHE_NAME = 'pwa-demo-edteam-cache-v1',
	urlsToCache = [
		'/',
		'./',
		'./?utm=homescreen',
		'./index.html',
		'./style.css',
		'./script.js',
		'./sw.js',
		'./favicon.ico',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
	]

self.addEventListener('install', e => {
	console.log('Evento: SW Instalado')
	e.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => {
				console.log('Archivos en cache')
				return cache.addAll(urlsToCache)
				.then(() => self.skipWaiting())
				//skipWaiting forza a SW a activarse
			})
			.catch(err => console.log('Fallo registro de cache', err))
	)
})

self.addEventListener('activate', e => {
	console.log('Evento: SW Activado')
	const cacheList  = [CACHE_NAME]
	e.waitUntil(
		caches.keys()
			.then(cachesName => {
				return Promise.all(
					cachesName.map(cacheName => {
						//Se elimina lo que ya no se necesita en cache
						if (cacheList.indexOf(cacheName) === -1){
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				console.log('El cache esta limpio y actualizado')
				// Le indica al SW activar el cache actual
				return self.clients.claim()
			})
			.catch()
	)
})

self.addEventListener('fetch', e => {
	console.log('Evento: SW Recuperando')
	e.respondWith(
		caches.match(e.request)
		.then(res => {
			if (res){
				return res
			}
			return fetch(e.request)
				.then(res => {
					let resToCache = res.clone()
					caches.open(CACHE_NAME)
						.then(cache => {
							cache
								.put(e.request, resToCache)
								.catch(err => console.log(`${e.request.url}: ${err.message}`))
						})
						return res
				})
		})
	)
})

self.addEventListener('push', e => {
	console.log('Evento: Push')

	const title = 'Push Notification Demo'
	const options = {
		body: 'Click para regresar a la aplicación',
		icon: './img/icon_192x192.png',
		//vibrate: [100, 50, 100],
		//data: { id:1 }
		// actions: [
		// 	{
		// 		'action': 'Si', 'title': 'Amo esta aplicacion', icon: './img/icon_192x192.png'
		// 	},
		// 	{
		// 		'action': 'No', 'title': 'No me gusta esta aplicacion', icon: './img/icon_192x192.png'
		// 	}
		// ]
	}
	e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
	console.log(e)

	if(e.action === 'Si'){
		console.log('Amo esta aplicacion')
		clients.openWindow('http://ed.team')
	}else if (e.action === 'No'){
		console.log('No me gusta esta aplicacion')
	}
	e.notification.close()
})

self.addEventListener('sync', e => {
	console.log('Evento: Sincronizacion de Fondo', e)

	//Revisar que la etiqueta de sincronizacion sea la definida o la que emulan los devtools
	if (e.tag === 'github' || e.tag === 'test-tag-from-devtools'){
		e.waitUntil(
			self.clients.matchAll()
				.then( all => {
					return all.map(client => {
						return client.postMessage('online')
					})
				})
				.catch(err => console.log(err))
		)
	}	
})

// self.addEventListener('message', e => {
// 	console.log('Desde la sincronizacion de Fondo', e.data)
// 	fetchGitHubuser(localStorage.getItem('github'), true)
// })