var mysql = require('../node_modules/mysql');

var connect = require('../database').connect;


function Photo(user_id, type, date, id)
{
	this.id = id;
	this.user_id = user_id;
	this.type = type;
	if (!date){
		this.date = new Date();
	}
	else {

		this.date = new Date(parseInt(date));
	}
}

Photo.clear = function(callback)
{
	var fs = require('fs');
	fs.readdirSync('images/').forEach(function(fileName){
		console.log('Removing file: ' + fileName);
		fs.unlinkSync('images/'+fileName);
	});
	var db = connect();
	db.query('DELETE FROM photos', callback);
	db.end();
}


Photo.createTable = function(callback)
{
	var db = connect();
	db.query('CREATE TABLE photos (id int auto_increment, user_id int, type varchar(4), date long, PRIMARY KEY(id) )', callback);
	db.end();
}

Photo.dropTable = function(callback)
{
	Photo.clear(function(err){
		if (err){
			console.log(err);
			callback(err);
			return;
		}
		var db = connect();
		db.query('DROP TABLE photos', callback);
		db.end();
	});

}

Photo.prototype.save = function(callback)
{
	var db = connect();
	if (this.id){

	}
	else{
		var that = this; //gross
		db.query('INSERT INTO photos (user_id, type, date) VALUES (?, ?, ?)', [this.user_id, this.type, this.date.getTime()], function(err, result){
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

Photo.prototype.saveForceId = function(callback)
{
	var db = connect();

	var that = this; //gross
	db.query('INSERT INTO photos (user_id, type, date, id) VALUES (?, ?, ?, ?)', [this.user_id, this.type, this.date.getTime(), this.id], function(err, result){
		if (err){
			console.log(err);
			callback(err);
		}
		that.id = result.insertId;
		if (callback){
			callback(err);
		}
	});

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




module.exports = Photo;