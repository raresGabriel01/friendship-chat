
// Modules

const express = require('express');
const session = require('express-session');
const path = require('path');
const formidable = require("formidable");
const crypto = require("crypto");
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const socket = require('socket.io');
const cookieParser = require("cookie-parser");
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
				let cryptingAlgorithm=crypto.createCipher('aes-128-cbc',"cryptingpassword");
				cryptedPassword = cryptingAlgorithm.update(fields.password, "utf-8", "hex");
				cryptedPassword += cryptingAlgorithm.final("hex");
				await client.query("INSERT INTO waiting_users(username, email, password) VALUES ('" + fields.username +"','"+fields.email+"','"+cryptedPassword+"');");
				

				let textLink = "https://friendship-chat.herokuapp.com/confirm/?username="+fields.username;
				let reportLink = "https://friendship-chat.herokuapp.com/report"
				let html = '<img style="display:block;margin:auto;width:50%" src ="https://i.pinimg.com/originals/9f/8d/5d/9f8d5d463f7b67c2be23d31791384254.jpg">\
							<h1 style="text-align:center"> Hello, ' + fields.username  +' !</h1>\
							<p style="text-align:center;font-size:18px;"> You are just a step away from being able to use our platform </p>\
							<p style="text-align:center;font-size:18px;"> To confirm your registration, click <a href=\"'+ textLink.toString() + '\"> here </a> </p>\
							<p style="text-align:center;font-size:18px;"> If you do not remember registering to our website, please report it <a href=\"'+ reportLink.toString() + '\"> here </a> </p>'
				await sendEmail(fields.email, 'Confirm your registration', html);

				res.send('OK');
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
		let cryptingAlgorithm=crypto.createCipher('aes-128-cbc',"cryptingpassword");
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
				let cryptingAlgorithm=crypto.createCipher('aes-128-cbc', 'cryptingpassword');
				cryptedUsername = cryptingAlgorithm.update(fields.username,'utf-8','hex');
				cryptedUsername += cryptingAlgorithm.final('hex');
				res.cookie('username', cryptedUsername, {httpOnly:true});
				req.session.user = {'username':fields.username};
				res.send('3');
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

var io = socket(server);
io.on('connection', async (socket) => {
	
  	var _username = stringToObject(socket.handshake.headers.cookie).username;
  	var decipher = crypto.createDecipher('aes-128-cbc', 'cryptingpassword');
 	_username = decipher.update(_username, 'hex', 'utf-8');
 	_username += decipher.final('utf-8');

 	let client = await pool.connect();
	let result = await client.query("SELECT * FROM users WHERE username = '" + _username +"';");

	if(result.rows.length != 1) {
		console.log(result.rows);
		socket.emit('error');
	}
	else {
		console.log("===============================================\nI'm here\n====================================\n");
		console.log(searchingUsers);
	    var room = null;
	    socket.on('searching',(data)=>{
	    	console.log("---------------------------------------------------\nI'm searching\n------------------------------------\n");

	    	searchingUsers[_username] = "nothing"; //to upgrade later;
	    	var flag = false;
	    	
	    	for(let user of Object.keys(searchingUsers)) {
	    		if(searchingUsers[user] == searchingUsers[_username] && user != _username) {
	    			console.log('==================================================found it========================================\n');
	    			flag = true;
	    			socket.join(user);
	    			room = user;
	    			socket.to(user).emit('found', {username:_username});
	    			socket.emit('found', {username:user});
	    			delete searchingUsers[user];
	    			delete searchingUsers[_username];
	    		}
	    	}
	    	if(!flag) {
	    		socket.join(_username);
	    		room = _username;
	    	}
	    });

	    socket.on('message', (data)=> {
	    	io.in(room).emit('message',{username:_username,message:data.message});
	    });

	    socket.on('disconnect', ()=> {
	    	if(room) {
	    		io.in(room).emit('disconnectMessage',{username:_username});
	    	}
	    });
	}
   	

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
    		console.log(error);
  		} else {
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