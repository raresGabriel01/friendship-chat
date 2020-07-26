
// Modules

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');	// Using the ejs view engine

app.use(express.static(path.join(__dirname, 'resources'))); // resources as entry point

app.use(session({
	secret: "sessionKey",
	resave: true,
	saveUninitialized: false
}));

app.get('/', (req, res) => {	// request for home page
	res.render('html/home');
});

app.get('/*', (req, res) => {	// treating a general request 
	res.render('html' + req.url);
});


app.listen(process.env.PORT || 3000, () => {console.log("App running on port 3000")});