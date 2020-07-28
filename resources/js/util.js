function randInt(a,b) {
	return Math.floor(Math.random()*(b-a) + a);
}

function displayLoginForm() {
	let cover = document.createElement('div');
	cover.classList.add('cover');
	cover.id = 'cover';
	cover.addEventListener('click', (e) => {
		cover.parentNode.removeChild(cover);
	});
	let loginForm = document.createElement('div');
	loginForm.classList.add('login');
	loginForm.addEventListener('click',(e) => {
		e.stopPropagation();
	})
	loginForm.innerHTML = "<p class ='title'> Login </p>\
							<label>\
							Uername: <input type='text' placeholder = 'Your username'/>\
							</label>\
							<label>\
							Password: <input type='password' placeholder = 'Your password'/>\
							</label>\
							<button class = 'loginButton'> Submit </button>\
							<p> Do you have an account? If not, click <a href = '/register'>here</a> </p>\
							<p>Do you encounter any difficulties logging in? Click <a href = 'javascript:void(0)'>here </a> </p>";
	if(window.innerWidth <= 760) {
		loginForm.innerHTML += "<button class = 'loginButton' onclick = 'goBack()'> Go Back </button>";
	}
	cover.appendChild(loginForm);
	document.getElementById('body').appendChild(cover);
}

function goBack() {
	let cover = document.getElementById('cover');
	cover.parentNode.removeChild(cover);
}