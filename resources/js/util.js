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
	let loginForm = document.createElement('form');
	loginForm.classList.add('login');
	loginForm.addEventListener('click',(e) => {
		e.stopPropagation();
	});
	loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		submitForm();
	});
	loginForm.innerHTML = "<p class ='title'> Login </p>\
							<label>\
							Username: <input type='text' id = 'loginUsername' placeholder = 'Your username' name = 'username'/>\
							</label>\
							<label>\
							Password: <input type='password' id = 'loginPassword' placeholder = 'Your password' name = 'password'/>\
							</label>\
							<span class = 'warning' id ='warning'></span>\
							<input type='submit' class = 'loginButton' value = 'Submit'/>\
							<p> Do you have an account? If not, click <a href = '/register'>here</a> </p>\
							<p>Do you encounter any difficulties logging in? Click <a href = 'javascript:void(0)'>here </a> </p>\
							";
	if(window.innerWidth <= 760) {
		loginForm.innerHTML += "<input type='button' class = 'loginButton' onclick = 'goBack()' value ='Go Back'/> ";
	}
	cover.appendChild(loginForm);
	document.getElementById('body').appendChild(cover);
}

function goBack() {
	let cover = document.getElementById('cover');
	cover.parentNode.removeChild(cover);
}

function submitForm() {
	let warning = document.getElementById('warning');
	let username = document.getElementById('loginUsername').value;
	let password = document.getElementById('loginPassword').value;
	let flag = true;
	if(!username || username.trim() == '' || !password || password.trim() == '') {
		flag = false;
	}
	if(!flag) {
		warning.innerText = 'Please fill all fields !';
	}

	else {
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200){
				switch(this.responseText) {
					case '1':
						warning.innerText = 'Unknown username';
						break;
					case '2':
						warning.innerText = 'Wrong password';
						break;
					default:
						location.reload();
				}
			}
		}
		let params = `username=${username}&password=${password}`;
		xhttp.open('POST','/login',true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send(params);
	}
}

function setMinWidthOfMenu() {
	let dropMenu = document.getElementById('drop-menu');
	let dropLI = document.getElementById('drop');

	if(dropMenu && dropLI) {
		dropLI.addEventListener('mouseenter', (e) => {
			dropMenu.style.display = 'block';
			dropMenu.style.minWidth = dropLI.offsetWidth + 'px';
		});

		dropLI.addEventListener('mouseleave', (e) => {
			dropMenu.style.display = 'none';
		});
	}
}


