window.onload = () => {

	var randomColors = ["#f42069", "#b4da55","#5cd6d6","#ff66cc","#ffff4d","tomato","#33cc33","#4d4dff","#ff99ff","#d68720"];
	var letters = document.getElementsByClassName("letter");
	for(let i = 0; i < letters.length; i++) {
		letters[i].style.color = randomColors[i];
	}
	var preload = [];
	for(let i = 1; i <= 5; i++) {
		let newImage = new Image();
		newImage.src = '/img/friend' + i + '.jpg';
		preload.push(newImage);
	}

	

	var banner = document.getElementsByClassName("banner")[0];
	var number = 1;
	setInterval(() => {
		if(number == 5) {
			number = 0;
		}
		banner.style.backgroundImage = 'url(' + preload[number].src + ')';
		number ++;
	}, 6000);

	randomQuote();
	if(window.innerWidth <= 760) {
		swapOrder();
	}
}

function randomQuote() {
	let quote = document.getElementById('quote');
	let quotes = ['“Life is 10 percent what you experience and 90 percent how you respond to it.”',
				'“Every time you are tempted to react in the same old way, ask if you want to be a prisoner of the past or a pioneer of the future.”',
				'“Smile, breathe, and go slowly.”',
				'“You don’t have to control your thoughts. You just have to stop letting them control you.”',
				'“Nothing diminishes anxiety faster than action.”',
				'“Nothing can bring you peace but yourself.”',
				'“Time you enjoy wasting is not wasted time.”',
				'“Happiness is when what you think, what you say, and what you do are in harmony.”'];
	quote.innerText = quotes[randInt(0,quotes.length)];
}

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
							<p> Are you new here ? You can register by clicking <a href = 'javascript:void(0)'>here</a> </p>\
							<p>Do you encounter any difficulties logging in ? Click <a href = 'javascript:void(0)'>here </a> </p>";
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

function swapOrder() {
	let div1 = document.getElementById('guyOnBench');
	let div2 = document.getElementById('whatDoWeWantText');
	let aux = div1.innerHTML;
	div1.innerHTML = div2.innerHTML;
	div2.innerHTML = aux;
	div1.style.backgroundColor = '#66b8ff';
}