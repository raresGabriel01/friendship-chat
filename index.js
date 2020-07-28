
// Modules

const express = require('express');
const session = require('express-session');
const path = require('path');
const formidable = require("formidable");
const crypto = require("crypto");
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
				await client.query("INSERT INTO users(username, email, password) VALUES ('" + fields.username +"','"+fields.email+"','"+cryptedPassword+"');");
				res.send('OK');
			}
			catch(err) {
				res.send('NOT OK');
				console.log(err);
			}
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
				req.session.user = {'username':fields.username};
				res.send('3');
			}
		}
	});
});

app.get('/logout', function(req,res) {
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
})

app.get('/*', (req, res) => {	// treating a general request 
	let _user = null;
	if(req.session){
		if(req.session.user) {
			//res.render('html/home',{user:req.session.user});
			_user = req.session.user;
		}
	}
	res.render('html' + req.url, {user:_user});
});


app.listen(process.env.PORT || 3000, () => {console.log("App running")});


async function checkUsername(username) {
	let response = {'msg':'', 'color':''};
	try {
		let client = await pool.connect();
		let result = await client.query("SELECT username FROM users WHERE username = '" + username + "';");
		if(result.rows.length == 0) {
			response.msg = 'Username is ok';
			response.color = 'green';
		}
		else {
			response.msg = 'Username is not available';
			response.color = 'red';
		}
		
	}
	catch(err) {
		response.msg = 'Sorry, something went wrong';
		response.color = 'red';
	}
	return response;
}


async function checkEmail (email) {

	let response = {'msg':'', 'color':''};
	try {
		let client = await pool.connect();
		let result = await client.query("SELECT email FROM users WHERE email = '" + email + "';");
		if(result.rows.length == 0) {
			response.msg = 'Email is ok';
			response.color = 'green';
		}
		else {
			response.msg = 'Email is not available';
			response.color = 'red';
		}
		
	}
	catch(err) {
		response.msg = 'Sorry, something went wrong';
		response.color = 'red';
	}
	return response;
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