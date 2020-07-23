
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

app.get("/", function(req, res) {
	res.render("html/index");
})


app.listen(process.env.PORT || 3000, function(){console.log("App running on port 3000")});