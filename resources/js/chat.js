
var socket = io.connect('https://friendship-chat.herokuapp.com/chat');;
var chatContent;
var pageContainer;


	setMinWidthOfMenu();
	
    pageContainer = document.getElementById('pageContainer');

	
	
	socket.on('message', (data)=> {
		chatContent.innerHTML+="<div class ='message'><p class ='username'>"+data.username+":</p>\
															<p class = 'message'>"+data.message+"</p></div>";
	});
	socket.on('disconnectMessage', (data) => {
		chatContent.innerHTML+="<div class ='message'><p class ='disconnectMessage'>" + data.username + " has disconnected </p></div>";
	});

	socket.on('eroare', (data) => {
		document.getElementById('pageContainer').innerHTML = data.eroare;
	});

	socket.on('waiting', (data) =>  {
		console.log(data);
	});

	socket.on('found', (data) => {
		pageContainer.innerHTML = '<div class ="loadWrapper"><p class ="match fall"> Found a pair! </p> <p class = "match slide">'+data.username+'</p></div>';
		setTimeout(()=>{
			pageContainer.innerHTML = "	<div class ='contentWrap'><p class = 'title'> Chat here with"+data.username+"</p>\
			<p class = 'unregistered'> Warning! Once you leave this browser window, you will never be able to come back if you do\
			not request your partner's friendship ! </p><div id = 'chatWrap'>\
					<div id = 'chatContent'>\
					</div>\
					<input type = 'text' id = 'insertMessage' placeholder = 'Type something...'/>\
				</div> </div>";
			let msg = document.getElementById('insertMessage');
			msg.addEventListener('keydown', (e) => {
				if(e.code == 'Enter') {
					console.log('am trimis un mesaj');
					socket.emit('message', { message:msg.value});
				}
			});
			chatContent = document.getElementById('chatContent');
		},2500);
		
	});


function startChat() {
	
	pageContainer.innerHTML = '<div class ="loadWrapper"><div class ="loader"></div><p class ="mention">Searching...</p></div>'
	
	socket.emit('search',{test:'hey'});
	
}






