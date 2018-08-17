;
/*Funciones auto invocadas*/

//Registro de caracteristicas de PWA's
((d, w, n, c) => {
	//Registro sw
	if ('serviceWorker' in n){
		w.addEventListener('load', ()=>{
			n.serviceWorker.register('./sw.js')
				.then(registration => {
					c('Service Worker registrado con éxito', registration.scope)
				})
				.catch(err => c('Registro de Serive Worker fallido', err))
		})
	}

	//Activacion de permiso para notificaciones
	if (w.Notification && Notification.permission !== 'denied'){
		Notification.requestPermission(status => {
			c(status)
			let n = new Notification('Titulo', {
				body: 'Soy una notificacion',
				icon: './img/icon_192x192.png'
			})
		})
	}

	//activar sincronizacion de fondo
	if('serviceWorker' in n && 'SyncManager' in w){
		function registerBGSync(){
			n.serviceWorker.ready
				.then(registration => {
					return registration.sync.register('github')
						.then( () => c('Sincronizacion de fondo registradas'))
						.catch( err => c('Fallo la sincronizacion de fondo', err))
				})
		}
		registerBGSync()
	}
	//Compartiendo contenido con el API Share
	if (n.share !== undefined){
		 d.addEventListener('DOMContentLoaded', e => {
		 	let shareBtn = d.getElementById('share')

		 	shareBtn.addEventListener('click', e => {
		 		console.log("Hola")
		 		n.share({
		 				title: d.title,
		 				text: 'Hola soy un contenido para compartir',
		 				url: w.location.href,
		 			})
		 			.then( () => c('Contenido compartido con éxito'))
		 			.catch(err => c('Error al compartir', err))
		 	})
		 })
	}

})(document, window, navigator, console.log);


//Deteccion del estado de la conexion
((d, w, n, c) => {
	const header = d.querySelector('.Header'),
		  metaTagTheme = d.querySelector('meta[name=theme-color]')
	function networkStatus(e){
		c(e, e.type)
		if (n.onLine){
			metaTagTheme.setAttribute('content', '#F7DF1E')
			header.classList.remove('u-offline')
			alert('Conexion recuperada :)')
		}else{
			metaTagTheme.setAttribute('content', '#666')
			header.classList.add('u-offline')
			alert('Conexion perdida :(')
		}
	}

	d.addEventListener('DOMContentLoaded', e => {
		if (!n.onLine){
			networkStatus(this)
		}
		w.addEventListener('online', networkStatus)
		w.addEventListener('offline', networkStatus)
	})

})(document, window, navigator, console.log);

// Aplicacion demo interactuando con el API de Github y la sincronizacion
((d, w, n, c) => {
	const userInfo = d.querySelector('.GitHubUser'),
		  searchForm = d.querySelector('.GitHubUser-form')
	function fetchGitHubUser(username, requestFromBGSSync){
		let name =  username || 'escueladigital', 
		    url = `https://api.github.com/users/${name}`
		fetch(url, {method: 'GET'})
			.then(response => response.json())
			.then(userData => {
			if(!requestFromBGSSync){
				localStorage.removeItem('github')
			}

				let template = `
					<article class="GitHubUser-info">
						<h2>${userData.name}</h2>
						<img src="${userData.avatar_url}" alt="${userData.login}">
						<p>${userData.bio}</p>
						<ul>
							<li>User GibHub ${userData.login}</li>
							<li>Url GibHub ${userData.html_url}</li>
							<li>Seguidores GibHub ${userData.followers}</li>
							<li>Siguiendo GibHub ${userData.following}</li>
							<li>Locación GibHub ${userData.location}</li>
						</ul>
					</article>
				`
				userInfo.innerHTML =  template
			})
			.catch(err => {
				//Si el usuario esta offline y envia una peticion, esta se almacenara en localStorage
				//Una vez que el usuario este online, se activara la sincronizacion de fondo para recuperar la peticion fallida
				localStorage.setItem('github', name)
				c(err)
			})
	}	  
	fetchGitHubUser(localStorage.getItem('github'))

	searchForm.addEventListener('submit', e =>{
		e.preventDefault()

		let user = d.getElementById('search').value
		if (user === '') return
		localStorage.setItem('github', user)
		fetchGitHubUser(user)

		e.target.reset()
	})

	// n.serviceWorker('message', e => {
	// 	console.log('Desde la sincronizacion de Fondo', e.data)
	// 	fetchGitHubuser(localStorage.getItem('github'), true)
	// })

})(document, window, navigator, console.log);
