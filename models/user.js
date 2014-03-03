var crypto = require('crypto');
var mysql = require('../node_modules/mysql');
function connect()
{
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : ''
	});
	connection.connect();
	connection.query('USE snapgram_db');
	return connection;
}

function User(name, username, password, id)
{
	//hash pasword and verify unique username. 
	//var hashed_pass = crypto.createHash('sha256').update(password).digest('hex');
	var db = connect();

	this.name = name;
	this.username = username;
	this.password = password;
	this.id = id;

	db.end();
}

User.createTable = function(callback)
{
	var db = connect();
	db.query('CREATE TABLE users ( \
					id int auto_increment, \
					name varchar(255), \
					username varchar(255), \
					password char(255), \
					PRIMARY KEY(id) \
				)'
				, callback);
	db.end();
}

User.dropTable = function(callback)
{
	var db = connect();
	db.query('DROP TABLE users', callback);
	db.end();
}

User.login = function(username, password, callback)
{
	var db = connect();
	db.query('SELECT * FROM users WHERE username = ?', [username], function(err, rows, fields){
		if(err){
			console.log(err);
		}

		if (rows.length == 0){
			callback(err);
			return;
		}
		if (rows.length != 1){
			callback(err, "Multiple Results for username");
			return;
		}
		var hashed_pass = crypto.createHash('sha256').update(password).digest('hex');
		if (rows[0].password != hashed_pass) {
			callback(err, 'Incorrect username or password');
			return;
		}
		//login looks good.
		callback(err, null, new User(rows[0].name, rows[0].username, rows[0].password, rows[0].id));
		return;
	})
}

User.prototype.save = function(callback) 
{
	if (this.id) {
		//need to do something else to modify not insert
	}
	var db = connect();
	var that = this; //There has to be a better way!
	db.query('INSERT INTO users (name, password, username) VALUES (?, ?, ?)', [this.name, this.password, this.username], function(err, result){
		if(err){
			console.log(err);
			callback(err);
			return;
		}
		that.id = result.insertId;
		callback(err);
		return;

	})
	db.end();
};

User.prototype.saveForceId = function(callback)
{
	var db = connect();
	var that = this; //There has to be a better way!
	db.query('INSERT INTO users (name, password, username, id) VALUES (?, ?, ?, ?)', [this.name, this.password, this.username, this.id], function(err, result){
		if(err){
			console.log(err);
			callback(err);
			return;
		}
		that.id = result.insertId;
		callback(err);
		return;

	})
	db.end();
}

User.getById = function(user_id, callback)
{
	var db = connect();
	db.query('SELECT * FROM users WHERE id = ?', [user_id], function(err, rows){
		if (err) {
			console.log(err);
			callback(err);
			return;
		}
		if (rows.length > 1) {
			callback('Found multiple users for this id');
			return;
		}
		else if (rows.length == 0){
			callback(err, null);
		}
		else {
			callback(err, new User(rows[0].name, rows[0].username, rows[0].password, rows[0].id));
		}
	});
	db.end();
}

User.getByUsername = function(username, callback)
{
	var db = connect();
	db.query('SELECT * FROM users WHERE username = ?', [username], function(err, rows){
		if (err){
			console.log(err);
			callback(err);
			return;
		}

		var users = [];
		for (i=0; i<rows.length; i++){
			users.push(new User(rows[i].name, rows[i].username, rows[i].password, rows[i].id));
		}
		callback (err, users);

	});
	db.end();
}

User.clear = function(callback)
{
	var db = connect();
	db.query('DELETE FROM users', callback);
	db.end();
}

module.exports = User;