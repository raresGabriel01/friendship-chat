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
}