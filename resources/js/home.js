window.onload = () => {
	modifyMenu();	
	randomQuote();
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
