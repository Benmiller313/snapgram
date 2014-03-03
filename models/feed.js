var mysql = require('../node_modules/mysql');

var Subscription = require('./subscription');
var Photo = require('./photo')

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

function Feed(user_id, photo_id, id)
{
	this.user_id = user_id;
	this.photo_id = photo_id;
	this.id = id;
}

Feed.createTable = function(callback)
{
	var db = connect();
	db.query('CREATE TABLE feeds (id int auto_increment, user_id int, photo_id int, PRIMARY KEY(id))', callback);
	db.end();
}

Feed.dropTable = function(callback)
{
	var db = connect();
	db.query('DROP TABLE feeds', callback);
	db.end();
}

Feed.clear = function(callback)
{
	var db = connect();
	db.query('DELETE FROM feeds', callback);
	db.end();
}

Feed.prototype.save = function(callback) {
	var db = connect();
	if (this.id){

	}
	else { 
		db.query('INSERT INTO feeds (user_id, photo_id) VALUES(?,?)', [this.user_id, this.photo_id], callback);
	}
	db.end();
};

Feed.getFeedForUser = function(user_id, callback) { 
	//Get a list of all photo ids, then load the photos for those ids
	var db = connect();
	console.log('getting feed info for ' + user_id);
	db.query('SELECT * FROM feeds WHERE user_id = ?', [user_id], function(err, rows){
		var photo_ids = rows.map(function(row){ return row.photo_id; });
		console.log(photo_ids);
		if (photo_ids.length==0){
			callback(err, photo_ids);
			return;
		}
		Photo.getListOfPhotos(photo_ids, callback);
	})
	db.end();
}


Feed.updateFeeds = function(user_id, photo_id, callback)
{
	//all users following user_id need to get a new feed entry 
	// with their id and the photo id. 
	Subscription.getAllSubscribers(user_id, function(err, subs){
		console.log(subs);
		if (err){
			callback(err);
			return;
		}
		console.log('making feeds for users: ')
		console.log(subs);
		for(i=0; i<subs.length; i++){
			var entry = new Feed(subs[i], photo_id);
			entry.save();
		}
		callback(err);
	});

}

module.exports = Feed;