
window.onload = () => {
	var body = document.getElementById('body');
	modifyMenu();
	setAvatarHeight();
	hobbies();
	updateHobbyEvents();
	getAvatar();
}


function hobbies() {
	document.getElementById('editHobbies').addEventListener('click', (e) => {
	
		var hobbies = document.createElement('div');
		
		hobbies.id = 'addHobbies';
		

		var input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Type your hobbies here separated by a space character';

		hobbies.appendChild(input);

		var button = document.createElement('button');
		button.innerText = 'Add hobbies';



		hobbies.appendChild(button);

		hobbies.addEventListener('click', (e) => {
			e.stopPropagation();
		});


		var cover = document.createElement('div');
		cover.classList.add('cover');
		cover.id = 'cover';

		cover.addEventListener('click', (e) => {
			cover.parentNode.removeChild(cover);
		});
		button.addEventListener('click', (e) => {
			var hobbies = input.value.split(' ');
			var hobbyList = document.getElementById('hobbies');
			for(let i =0 ; i < hobbies.length; i++ ) {
				if(hobbies[i].trim() != "") {
					hobbyList.innerHTML += '<span class = "hobby">' + hobbies[i] + ' <i class="fa fa-times-circle" aria-hidden="true"></i></span>';
				}
			}
			updateHobbyEvents();
			let xhttp = new XMLHttpRequest();
			xhttp.open('POST', '/updateHobbies', true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			let action = 'add';
			let params = `action=${action}&hobbies=${input.value}`;
			xhttp.send(params);
			cover.parentNode.removeChild(cover);
		});
		cover.appendChild(hobbies);

		body.appendChild(cover);

	});
}

function updateHobbyEvents() {
	var x = document.getElementsByClassName('fa-times-circle');
	for(let el of x) {
		el.addEventListener('click', (e)=>{
			let parent = el.parentNode;
			
			let xhttp = new XMLHttpRequest();
			xhttp.open('POST', '/updateHobbies', true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			let action = 'remove';
			let hobby = parent.innerText.trim(); //added .trim() to remove the space between the text and the icon
			let params = `action=${action}&hobby=${hobby}`;
			xhttp.send(params);
			parent.parentNode.removeChild(parent);
		});
	}
}

function imageUpload(e) {
	let files = e.target.files;
	let file = files[0];
	
	document.getElementById('upload').innerText = file.name;
}

function getAvatar() {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.status == 200 && this.readyState == 4) {
			let profileImage = document.getElementById('profileImage');
			if(this.responseText == 'Not found') {
				profileImage.src = '/img/profile.jpg';
			}
			else {
				
				profileImage.src = this.response;
			}
			
		}
	}
	xhttp.open('GET', '/getAvatar', true);
	//xhttp.setRequestHeader()
	xhttp.send();

}

function setAvatarHeight() {
	let profileImage = document.getElementById('profileImage');
	profileImage.style.height = profileImage.offsetWidth + 'px';
}