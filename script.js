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

})(document, window, navigator, console.log);

((d, w, n, c) => {

})(document, window, navigator, console.log);

((d, w, n, c) => {

})(document, window, navigator, console.log);

((d, w, n, c) => {

})(document, window, navigator, console.log);
