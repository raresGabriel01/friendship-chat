var username, email, password, cpassword;
var usernameWarning, emailWarning, passwordWarning, cpasswordWarning;
var fields;
var warnings;
var submitWarning;
window.onload = () => {
	username = document.getElementById('username');
	email = document.getElementById('email');
	password = document.getElementById('password');
	cpassword = document.getElementById('cpassword');
	usernameWarning = document.getElementById('usernameWarning');
	emailWarning = document.getElementById('emailWarning');
	passwordWarning = document.getElementById('passwordWarning');
	cpasswordWarning = document.getElementById('cpasswordWarning');
	submitWarning = document.getElementById('submitWarning');
	fields = [username, email, password, cpassword];
	warnings = [usernameWarning, emailWarning, passwordWarning, cpasswordWarning];
	var usernameTimer, emailTimer, passwordTimer, cpasswordTimer;
	var timers = [usernameTimer, emailTimer, passwordTimer, cpasswordTimer];
	for(let i = 0; i < fields.length; i++) {
		fields[i].addEventListener('keyup', (e) => {
			clearTimeout(timers[i]);
			if(fields[i].value && fields[i].value.trim() != "") {
				timers[i] = setTimeout(() => {
					switch(i) {
						case 0:
							checkUsername(fields[i].value);
							break;
						case 1:
							checkEmail(fields[i].value);
							break;
						case 2:
							checkPassword(fields[i].value);
							break;
						case 3:
							checkCPassword(fields[i].value);
							break;
					}
				}, 1200);
			}
		});
		if(i !=2) {
			fields[i].addEventListener('keydown', (e) => {
				if(e.code == 'Space' || e.code == 'Tab') {
					e.preventDefault();
				}
				else {
					warnings[i].innerText = "";
				}
				
			});
		}

		else {
			fields[i].addEventListener('keydown', (e) => {
				if(e.code == 'Space') {
					e.preventDefault();
				}
				else {
					warnings[i].innerText = "";
					warnings[i+1].innerText = "";					
				}
				
			});
		}
	}
}

function makeRequest() {
	for(let i = 0; i < warnings.length; i++) {
		if(warnings[i].innerText.trim() == '' || warnings[i].style.color == 'red' || warnings[i].style.color == 'darkred') {
			submitWarning.innerText = 'Please fill all the form fields correctly !';
		}
	}
	if(submitWarning.innerText == "") {
		let xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
			if(this.status == 200 && this.readyState == 4) {
				let registerForm = document.getElementsByClassName('registerForm')[0];
				registerForm.style.textAlign = 'center';
				if(this.responseText == 'OK') {
					registerForm.innerHTML = "";
					registerForm.style.color = 'green';
					registerForm.innerText = 'User succesfully registerd';
				}
				else {
					registerForm.style.color = 'red';
					registerForm.innerText = 'Something went wrong, please try again';
				}
			}
		}
		params = `username=${username.value}&email=${email.value}&password=${password.value}&cpassword=${cpassword.value}`;
		xhttp.open('POST', '/registerNewUser', true);
		xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhttp.send(params);
	}

}



function checkUsername(username) {
	if(username.length > 15) {
		usernameWarning.style.color = 'red';
		usernameWarning.innerText = 'Your username is too long';
		return ;
	}
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			let json = JSON.parse(this.responseText);
			usernameWarning.style.color = json.color;
			usernameWarning.innerText = json.msg;
		}
	}
	xhttp.open('GET', '/checkUsername/?username='+username,true);
	xhttp.send();
}

function checkEmail(email) {
	if(email.length > 150) {
		emailWarning.style.color = 'red';
		emailWarning.innerText = 'Your email adress is too long';
		return ;
	}
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			let json = JSON.parse(this.responseText);
			emailWarning.style.color = json.color;
			emailWarning.innerText = json.msg;
		}
	}
	xhttp.open('GET', '/checkEmail/?email='+email, true);
	xhttp.send();
}

function checkPassword(password) {
	if(password.length > 150) {
		passwordWarning.style.color = 'red';
		passwordWarning.innerText = 'Your password is too long';
		return ;		
	}
	let points = 0;
	let usualCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let digits =  '0123456789';
	if(password.length >= 8) {
		points++;
	}
	if(password.toLowerCase() != password) {
		points++;
	}
	if(password.toLowerCase().split('').filter(x => !usualCharacters.split('').includes(x)).length > 0) {	// i.e. password contains more than just usualCharacters
		points++;
	}
	if(password.split('').filter(x => digits.split('').includes(x)).length > 0) {
		points++;
	}	

	let msg = "";
	let color = "";

	if(password.length < 6) {
		msg = 'Your password is too short';
		color = 'red';
	}
	else {
		switch(points) {
			case 0:
				msg = 'Very weak password';
				color = 'darkred';
				break;
			case 1:
				msg = 'Weak password';
				color = 'red';
				break;
			case 2:
				msg = 'Medium password';
				color = 'yellow';
				break;
			case 3:
				msg = 'Strong password';
				color = 'green';
				break;
			default:
				msg = 'Very strong password';
				color = 'darkgreen';
				break;
		}		
	}



	passwordWarning.style.color = color;
	passwordWarning.innerText = msg;

	if(cpassword.value && cpassword.value.trim() != "") {
		checkCPassword(cpassword.value);
	}
}
function checkCPassword(cpassword) {
	let color = '';
	let msg = '';
	if(cpassword == password.value) {
		msg = 'Passwords match !';
		color = 'green';
	}
	else {
		msg = "Your passwords don't match";
		color = 'red';
	}
	cpasswordWarning.style.color = color;
	cpasswordWarning.innerText = msg;
} 