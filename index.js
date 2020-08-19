
// Modules

const express = require('express');
const session = require('express-session');
const path = require('path');
const formidable = require("formidable");
const crypto = require("crypto");
const fs = require('fs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const socket = require('socket.io');
const cookieParser = require("cookie-parser");
const util = require('util');
const pool = new Pool({
  connectionString:process.env.DATABASE_URL,
 
  ssl: {
    rejectUnauthorized: false
  }
});




const app = express();

app.set('view engine', 'ejs');	// Using the ejs view engine

app.use(express.static(path.join(__dirname, 'resources'))); // resources as entry point

app.use(session({
	secret: "sessionKey",
	resave: true,
	saveUninitialized: false
}));










app.post('/registerNewUser',async (req,res)=> {
	var form = new formidable.IncomingForm();
	form.parse(req, async (err, fields, files) => {
		let r1 = await checkEmail(fields.email);
		let r2 = await checkUsername(fields.username);
		let r3 = checkPassword(fields.password);
		if(r1.color && r1.color == 'green' && r2.color && r2.color == 'green' && r3 == true) {
			try {
				let client = await pool.connect();
				let cryptedPassword;
				let cryptingAlgorithm=crypto.createCipher('aes-128-cbc',process.env.CRYPTING_PASSWORD);
				cryptedPassword = cryptingAlgorithm.update(fields.password, "utf-8", "hex");
				cryptedPassword += cryptingAlgorithm.final("hex");
				await client.query("INSERT INTO waiting_users(username, email, password) VALUES ('" + fields.username +"','"+fields.email+"','"+cryptedPassword+"');");
				

				let textLink = "https://friendship-chat.herokuapp.com/confirm/?username="+fields.username;
				
				let html = '<img style="display:block;margin:auto;width:50%" src ="https://i.pinimg.com/originals/9f/8d/5d/9f8d5d463f7b67c2be23d31791384254.jpg">\
							<h1 style="text-align:center"> Hello, ' + fields.username  +' !</h1>\
							<p style="text-align:center;font-size:18px;"> You are just a step away from being able to use our platform </p>\
							<p style="text-align:center;font-size:18px;"> To confirm your registration, click <a href=\"'+ textLink.toString() + '\"> here </a> </p>\
							<p style="text-align:center;font-size:18px;"> If you do not remember registering to our website, please contact us </p>'
				try {
					let emailResponse = await sendEmail(fields.email, 'Confirm your registration', html);
					res.send('emailResponse');
				}
				catch(error) {
					console.log('eroare '+error)
					res.send('error');
				}
				
				//
				
			}
			catch(err) {
				res.send('NOT OK');
				console.log(err);
			}
		}
		else {
			res.send('NOT OK');
		}
	});
});

app.post('/login', async(req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, async(err, fields, files) => {
		let client = await pool.connect();
		let cryptedPassword;
		let cryptingAlgorithm=crypto.createCipher('aes-128-cbc',process.env.CRYPTING_PASSWORD);
		cryptedPassword = cryptingAlgorithm.update(fields.password, "utf-8", "hex");
		cryptedPassword += cryptingAlgorithm.final("hex");

		let result = await client.query("SELECT username, password FROM users WHERE username = '" + fields.username +"';");

		if(result.rows.length != 1) {
			res.send('1');
		}
		else {
			if(result.rows[0].password != cryptedPassword) {
				res.send('2');
			}
			else {
				let cryptedUsername;
				let cryptingAlgorithm=crypto.createCipher('aes-128-cbc', process.env.CRYPTING_PASSWORD);
				cryptedUsername = cryptingAlgorithm.update(fields.username,'utf-8','hex');
				cryptedUsername += cryptingAlgorithm.final('hex');
				res.cookie('username', cryptedUsername, {httpOnly:true});
				req.session.user = {'username':fields.username};
				res.redirect('/');
			}
		}
	});
});

app.get('/logout', (req,res) => {
	res.clearCookie('username');
  	req.session.destroy();
  	res.redirect('/');
});




app.get('/', (req, res) => {	// request for home page
	let _user = null;
	if(req.session){
		if(req.session.user) {
			//res.render('html/home',{user:req.session.user});
			_user = req.session.user;
		}
	}	
	res.render('html/home',{user:_user});
});

app.get('/checkUsername', async (req, res) => {
	let username = req.query.username;
	if(username.length > 15) {
		res.json({'msg':'Your username is too long', 'color':'red'});
	}
	let response = await checkUsername(username);
	if(response == null) {
		res.send("Error");
	}
	else {
		res.json(response);
	}
});


app.get('/checkEmail', async(req, res) => {
	console.log('check mail req')
	let email = req.query.email;
	if(email.length > 150) {
		res.json({'msg':'Your email adress is too long','color':'red'});
	}
	let response = await checkEmail(email);
	if(response == null) {
		res.send("Error");
	}
	else {
		res.json(response);
	}
	console.log(response);
});

app.get('/confirm', async (req,res) => {
	let _user = null;
	if(req.session) {
		if(req.session.user) {
			_user = req.session.user;
		}
	}

	let username = req.query.username;

	let client = await pool.connect();
	let result = await client.query("SELECT * FROM waiting_users WHERE username = '" + username +"';");
	if(result.rows.length == 1) {
		await client.query("DELETE FROM waiting_users WHERE username = '" + username + "';");
		await client.query("INSERT INTO users(username, email, password) VALUES ('" + result.rows[0].username +"','"+result.rows[0].email+"','"+result.rows[0].password+"');");
		res.render('html/confirm');
	}
	else {
		res.redirect('/404');
	}
});

app.get('/profile', async (req, res) => {
	let _user = null;
	if(req.session) {
		if(req.session.user) {
			_user = req.session.user;
		}
	}

	if(_user) {
		let client = await pool.connect();
		let result = await client.query("SELECT hobbies FROM users WHERE username = '" + _user.username + "';");
		let _hobbies = result.rows[0].hobbies.split(' ');
		res.render('html/profile', {user:_user, hobbies:_hobbies});
	}
	else {
		res.redirect('/404');
	}

});

app.post('/updateHobbies',async (req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, async(err, fields, files) =>{
		let client = await pool.connect();
		if(fields.action == 'add') {
			await client.query("UPDATE users SET hobbies = CONCAT (hobbies, ' "+fields.hobbies+"') WHERE username = '" + req.session.user.username +"';");
		}
		else {
			await client.query("UPDATE users SET hobbies = REPLACE(hobbies,'" + fields.hobby + "', '') WHERE username = '" +req.session.user.username+"';");
		}
	});
	res.send('ok');
});


app.post('/uploadAvatar', async (req, res)=> {
    var form = new formidable.IncomingForm();
    
    form.parse(req);

    const username = req.session.user.username;
    
    const path = '/user_uploads/' + username;
    
	form.on('fileBegin', (name, file) =>{
		//ca sa salvam la locatia dorita setam campul path al lui file
		
		if(file && file.name!=""){
			
			fs.mkdirSync(process.cwd() + path, {recursive:true}, (error) => {
				if(error) {
					console.log("error here ===> "  + error);
				}
			});
			file.path = process.cwd() + path + '/avatar.jpg';
			
		}
	});
	form.on('file',function(name, file){
		res.redirect('/profile');
	});


	
});

app.get('/getAvatar', async (req, res) => {
	
	//res.sendFile(process.cwd() + '/user_uploads/' + req.session.user.username + '/avatar.jpg', (err) => {
	//	res.sendFile(process.cwd() + '/resources/img/profile.jpg');
	//});
	//let url = process.cwd() + '/user_uploads/' + req.session.user.username + '/avatar.jpg';
	let _username = null;
	if(req.session) {
		if(req.session.user) {
			_username = req.session.user.username;
		}
	}

	var url = null;

	if(_username) {
		url = process.cwd() + '/user_uploads/' + _username + '/avatar.jpg';
	}
	else {
		url = process.cwd() + '/resources/img/profile.jpg';
	}
	fs.readFile(url, 'base64', (err,base64Image) => {
		
		if(!base64Image) {
			
			res.send('Not found');
		}
		else {
			
			const dataUrl = `data:image/jpeg;base64,${base64Image}`;
			res.send(`${dataUrl}`);			
		}

	});
	
	
});

app.get('/*', (req, res) => {	// treating a general request 
	let _user = null;
	if(req.session){
		if(req.session.user) {
			//res.render('html/home',{user:req.session.user});
			_user = req.session.user;
		}
	}
	res.render('html' + req.url, {user:_user}, (err, html) => {
		if(err) {
			if(err.message.includes("Failed to lookup view")) {
				return res.status(404).render('html/404', {user:_user});
			}
			else {
				throw err;
			}
		}
		res.send(html);
	});
});


var server = app.listen(process.env.PORT || 3000, () => {console.log("App running")});

searchingUsers = {};
imageOf = {};

var io = socket(server);
io.on('connection', async (socket) => {
	
	socket.on('error', (err) => {
		socket.emit('error', {error:err});
	});

  	var _username = stringToObject(socket.handshake.headers.cookie).username;

  	var decipher = crypto.createDecipher('aes-128-cbc', process.env.CRYPTING_PASSWORD);
 	_username = decipher.update(_username, 'hex', 'utf-8');
 	_username += decipher.final('utf-8');
 	


	var room = null;
	socket.on('search',async (data)=>{

	 	let client = await pool.connect();
		let result = await client.query("SELECT * FROM users WHERE username = '" + _username +"';");
		if(result.rows.length != 1) {
			socket.emit('error', {error: 'Invalid username'});
		}
		else {
			imageOf[_username] = await getAvatarOf(_username);
			


			searchingUsers[_username] = result.rows[0].hobbies.split(' '); //to upgrade later;
			



			var flag = false;
			    	
			for(let user of Object.keys(searchingUsers)) {
				if(  user != _username && searchingUsers[user].filter(hobby => searchingUsers[_username].includes(hobby)).length > 0 ) {
			    			
			    	flag = true;
			    	socket.join(user);
			    	room = user;

			    	let img1 =  imageOf[user];
			    	let img2 =  imageOf[_username];



			    	socket.to(user).emit('found', {username:_username, img:img2});
			    	socket.emit('found', {username:user, img:img1});

			    	delete searchingUsers[user];
			    	delete searchingUsers[_username];
			    		}
			    }
			    if(!flag) {
			    	socket.join(_username);
			    	room = _username;
			    }
		    }
	});

	    socket.on('message', (data)=> {

	    	io.in(room).emit('message',{username:_username,message:data.message, img:imageOf[_username]});
	    });

	    socket.on('disconnect', ()=> {
	    	if(room) {
	    		io.in(room).emit('disconnectMessage',{username:_username});
	    	}
	    	delete searchingUsers[_username];
	    });
	
   	

});

async function checkUsername(username) {
	var response = {'msg':'', 'color':''};
	try {
		var client = await pool.connect();
		var result1 = await client.query("SELECT username FROM users WHERE username = '" + username + "';");
		var result2 = await client.query("SELECT username FROM waiting_users WHERE username ='" + username +"';");
		if(result1.rows.length == 0 && result2.rows.length == 0) {
			response.msg = 'Username is ok';
			response.color = 'green';
		}
		else {
			response.msg = 'Username is not available';
			response.color = 'red';
		}
		return response;
		
	}
	catch(err) {
		response.msg = 'Sorry, something went wrong';
		response.color = 'red';
		return response;
	}
	
}


async function checkEmail (email) {
	console.log('hey, im here');
	var response = {'msg':'', 'color':''};
	try {
		var client = await pool.connect();
		var result1 = await client.query("SELECT email FROM users WHERE email = '" + email + "';");
		var result2 = await client.query("SELECT email FROM waiting_users WHERE email = '" + email + "';");
		if(result1.rows.length == 0 && result2.rows.length == 0) {
			response.msg = 'Email is ok';
			response.color = 'green';
		}
		else {
			response.msg = 'Email is not available';
			response.color = 'red';
		}
		return response;
		
	}
	catch(err) {
		response.msg = 'Sorry, something went wrong';
		response.color = 'red';
		return response;
	}
	
}

function checkPassword(password) {
	if(password.length > 150) {
		return false;
	}
	if(password.length < 6) {
		return false;
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

	if(points >= 3) {
		return true;
	}	
	return false;
}

async function sendEmail (_reciever, _subject, _html) {
	var transporter = nodemailer.createTransport({
  		service: 'gmail',
  		auth: {
    		user: 'rares.gabi.web@gmail.com',
    		pass: process.env.EMAIL_PASSWORD
  		}
	});

	var mailOptions = {
  		from: 'rares.gabi.web@gmail.com',
  		to: _reciever,
  		subject: _subject,
  		html: _html
	};

	transporter.sendMail(mailOptions, function(error, info){
  		if (error) {
    		return 'error';
  		} else {
  			return 'OK';
    		console.log('Email sent: ' + info.response);
  		}
	});
}


function stringToObject(string) {
	let result = {};
	for(let piece of string.split('; ')) {
		let splitedPiece = piece.split('=');
		result[splitedPiece[0]] = splitedPiece[1];
	}

	return result;
}

 async function  getAvatarOf(username) {
	var response;
	var url = process.cwd() + '/user_uploads/' + username + '/avatar.jpg';
	const readFile = util.promisify(fs.readFile)
	try {
		var base64Image = await readFile(url, 'base64');
	}catch(err) {
		return '/img/profile.jpg';
	}
	
	return `data:image/jpeg;base64,${base64Image}`;
	
}