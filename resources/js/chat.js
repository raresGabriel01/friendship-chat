
var socket = io();
var chatContent;
var pageContainer;


modifyMenu();
	
pageContainer = document.getElementById('pageContainer');

	
	
socket.on('message', (data)=> {
	chatContent.innerHTML+="<div class ='message'><p class ='username' id ='lastUsername'></p>\
															<p class = 'message' id = 'lastMessage'></p></div>";
	let lastUsername = document.getElementById('lastUsername');
	let lastMessage = document.getElementById('lastMessage');
	lastUsername.innerText = data.username + ':';
	lastMessage.innerText = data.message;
	lastUsername.removeAttribute('id');
	lastMessage.removeAttribute('id');
	chatContent.scrollTop = chatContent.scrollHeight;

});
socket.on('disconnectMessage', (data) => {
	chatContent.innerHTML+="<div class ='message'><p class ='disconnectMessage'>" + data.username + " has disconnected </p></div>";
	chatContent.scrollTop = chatContent.scrollHeight;
});

socket.on('error', (data) => {
	document.getElementById('pageContainer').innerHTML = data.error;
});


socket.on('found', (data) => {
	pageContainer.innerHTML = '<div class ="loadWrapper"><p class ="match fall"> Found a pair! </p> <p class = "match slide">'+data.username+'</p></div>';
	setTimeout(()=>{
		pageContainer.innerHTML = "	<div class ='contentWrap'><p class = 'title'> Chat here with "+data.username+"</p>\
		<p class = 'unregistered'> Warning! Once you leave this browser window, you will never be able to come back if you do\
		not request your partner's friendship ! </p><div id = 'chatWrap'>\
				<div id = 'chatContent'>\
				</div>\
				<input type = 'text' id = 'insertMessage' placeholder = 'Type something...'/>\
				<button class = 'sendButton' id ='sendButton'> Send </button>\
				<button class = 'sendButton' id ='findNewChat' onclick='startChat()'> Chat with someone else </button>\
			</div> </div>";
		let msg = document.getElementById('insertMessage');
		let sendButton = document.getElementById('sendButton');
		msg.addEventListener('keydown', function(e) {
			console.log(this.value);
			if(e.code == 'Enter') {
				if(this.value && this.value.trim() != "") {
					socket.emit('message', { message:this.value});
					this.value = '';
				}

			}
		});
		
		sendButton.addEventListener('click', (e) => {
			socket.emit('message',{message:msg.value});
		})
		chatContent = document.getElementById('chatContent');
	},2500);
	
});


function startChat() {
	
	pageContainer.innerHTML = '<div class ="loadWrapper"><div class ="loader"></div><p class ="mention">Searching...</p></div>'
	
	socket.emit('search');
	
}
