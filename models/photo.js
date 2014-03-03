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

function Photo(user_id, type, date, id)
{
	if(id){
		this.id = id;
	}
	else{
		this.id = id;
	}
	this.user_id = user_id;
	this.type = type;
	if (!date){
		this.date = new Date();
	}
	else {

		this.date = new Date(parseInt(date));
		console.log(this.date);
	}
	console.log(this.date);
	console.log(this.date.getTime());
}


Photo.createTable = function(callback)
{
	var db = connect();
	db.query('CREATE TABLE photos (id int auto_increment, user_id int, type varchar(4), date long, PRIMARY KEY(id) )', callback);
	db.end();
}

Photo.dropTable = function(callback)
{
	var db = connect();
	db.query('DROP TABLE photos', callback);
	db.end();
}

Photo.prototype.save = function(callback)
{
	var db = connect();
	if (this.id){

	}
	else{
		var that = this; //gross
		db.query('INSERT INTO photos (user_id, type, date) VALUES (?, ?, ?)', [this.user_id, this.type, this.date.getTime()], function(err, result){
			console.log(result);
			if (err){
				console.log(err);
				callback(err);
			}
			that.id = result.insertId;
			if (callback){
				callback(err);
			}
		});
	}
	db.end();
}

Photo.getAllForUser = function(user_id, callback) 
{
	var db = connect();
	db.query('SELECT * FROM photos WHERE user_id = ?', [user_id], function(err, rows){
		if (err) {
			console.log(err);
			callback(err);
			return;
		}
		var photos = [];
		for (i=0; i < rows.length; i++){
			console.log(rows[i].date);
			photos.push(new Photo(rows[i].user_id, rows[i].type, rows[i].date, rows[i].id));
		}
		callback(err, photos);
	});
	db.end();
}

Photo.getListOfPhotos = function(photo_ids, callback)
{
	var db = connect();
	var photos = [];
	count = 0;
	var then = function(){
		count++;
		if (count == photo_ids.length){
			callback(null, photos);
		}
	}
	var forEachId = function(photo_id){
		db.query('SELECT * FROM photos WHERE id = ?', [photo_id], function(err, rows){
			if (err){
				console.log('Error in getListOfPhotos: ' + err);
				callback(err);
				return;
			}
			photos.push(new Photo(rows[0].user_id, rows[0].type, rows[0].date, rows[0].id));
			//Done? 
			then();
		});
	}
	for (i=0; i<photo_ids.length; i++){
		forEachId(photo_ids[i]);
	}
}

Photo.clear = function(callback)
{
	var db = connect();
	db.query('DELETE FROM photos', callback);
	db.end();
}

module.exports = Photo;