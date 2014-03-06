
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var sessions = require('./routes/sessions');
var feed = require('./routes/feed');
var photos = require('./routes/photos');
var bulk = require('./routes/bulk');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser({uploadDir : './images'}))
app.use(express.cookieParser('secret'));
app.use(express.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	console.log('test!');
  app.use(express.errorHandler());
}

//Setup production database: 
if ('production' == app.get('env')) { 
	console.log('Production test');
	mysql = require('mysql');
	conn = mysql.createConnection({
	  host: 'web2.cpsc.ucalgary.ca',
	  user: 's513_bamiller',
	  password: '10015748',
	  database: 's513_bamiller'
	});

	conn.connect();

	conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
	  if (err) throw err;

	  console.log('The solution is: ', rows[0].solution);
	});

	conn.end();

}

global.connect = function(){
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : ''
	});
	connection.connect();
	connection.query('USE snapgram_db');
	return connection;
}

function requireLogin(req, res, next){
	if(!req.session.user){
		res.redirect('/sessions/new');
	}
	else {
		next();
	}
}

function requireNoLogin(req, res, next){
	if(req.session.user){
		res.redirect('/feed');
	}
	else{
		next();
	}
}

function requirePassword(req, res, next){
	var password = 'test';
	if (req.query && req.query.password == password){
		next();
	}
	else{
		res.send('Incorrect password');
	}
}

app.get('/', requireNoLogin, routes.index);
app.get('/users', user.list);
app.get('/500test', user.test);
app.get('/users/new', requireNoLogin, user.registration);
app.post('/users/create', requireNoLogin,  user.create);
app.get('/sessions/new', requireNoLogin, sessions.login);
app.post('/sessions/create', requireNoLogin, sessions.create);
app.get('/sessions/logout', requireLogin, sessions.logout);

app.get('/feed', requireLogin, feed.userFeed);
app.get('/users/:id', requireLogin, feed.userStream);
app.get('/users/:id/:sub', requireLogin, feed.sub);

app.get('/photos/new', requireLogin, photos.add);
app.post('/photos/create', requireLogin, photos.create);
app.get('/photos/thumbnail/:id.:ext', requireLogin, photos.serveThumb);
app.get('/photos/:id.:ext', requireLogin, photos.serve);


//BULK UPLOAD REQUIREMENTS
app.get('/bulk/clear', requirePassword, bulk.clear);
app.post('/bulk/users', requirePassword, bulk.users);
app.post('/bulk/streams', requirePassword, bulk.photos);

app.use(function(req, res, next){
	res.status(404).send("Sorry!");
});

app.use(function(err, req, res, next){
	res.status(500);
	res.send("Error: " + err);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
