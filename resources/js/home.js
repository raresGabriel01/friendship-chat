window.onload = () => {
	modifyMenu();	
	randomQuote();
	//modifyLogo();
	adaptResponsive();
}


function randomQuote() {
	let quoteArray =['“Happiness is a direction, not a place.”',
					'“Happiness depends upon ourselves.”',
					'“It is not how much we have, but how much we enjoy, that makes happiness.”',
					'“For every minute you are angry you lose sixty seconds of happiness.”',
					'“Time you enjoy wasting is not wasted time.”',
					'“Happiness is when what you think, what you say, and what you do are in harmony.” \n - Mahathma Gandhi'];
	let quote = document.getElementById('randomQuote');
	quote.innerText = quoteArray[randInt(0, quoteArray.length)];
}

function adaptResponsive () {
	if(window.innerWidth <= 765) {
		let textWrap = document.getElementsByClassName('textWrap')[0];
		textWrap.parentNode.removeChild(textWrap);
		let banner = document.getElementsByClassName('banner')[0];
		banner.innerHTML += "<h1 class='mobileTitle'> Friendship </h1> <span class='mobileSubtitle'> Click. Chat. Make friends. </span>";
		banner.innerHTML += "<img src = '/img/favicon.png' id='logo'/>"






		let contentWrap = document.getElementById('contentWrap');
		contentWrap.style.width = '100%';
		contentWrap.style.left = '0';

		let aside = document.getElementsByClassName('left')[0];
		aside.parentNode.removeChild(aside);



		let sections = document.querySelectorAll('div#grid>section');
		for(let section of sections){
			section.classList.add('wide');
		}


		let change1 = document.getElementById('change1');
		let change2 = document.getElementById('change2');

		let aux = change1.innerHTML;
		change1.innerHTML = change2.innerHTML;
		change2.innerHTML = aux;
	}
}
/*function modifyLogo() {
	let logo = document.getElementById('logo');
	logo.style.height = logo.offsetWidth + 'px';
	console.log(document.getElementsByClassName('titleText')[0].offsetWidth);
	logo.style.left = parseInt(document.getElementsByClassName('titleText')[0].offsetWidth)/2 + 'px';
}*/