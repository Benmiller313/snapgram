
var mysql = require('../node_modules/mysql');
var connect = require('../database').connect;


function Subscription(follower_id, target_id, id)
{
	this.id = id;
	this.follower_id = follower_id;
	this.target_id = target_id;
}

Subscription.createTable = function(callback)
{
	var db = connect();
	db.query('CREATE TABLE subscriptions (\
							id int auto_increment,\
							follower_id int,\
							target_id int,\
							PRIMARY KEY(id)\
						)'
				, callback);
	db.end();
}

Subscription.dropTable = function(callback)
{
	var db = connect();
	db.query('DROP TABLE subscriptions', callback);
	db.end();
}

Subscription.prototype.save = function(callback)
{
	var db = connect();
	if (this.id){
		console.log('error');
	}
	else{
		//check if it exists
		var that = this; //gross
		db.query('SELECT * FROM subscriptions WHERE follower_id = ? AND target_id = ?', [this.follower_id, this.target_id], function(err, rows){
			if (err){
				console.log(err);
				if (callback) callback(err);
				db.end();
				return;
			}

			if(rows.length == 0){
				//good to go
				db.query('INSERT INTO subscriptions (follower_id, target_id) VALUES (?, ?)', [that.follower_id, that.target_id], function(err, result){
					if (err){
						console.log(err);
						if (callback) callback(err);
						return;
					}
					that.id = result.insertId;
					if (callback){
						callback(err);
					}
				});
			}
			else {
				if (callback){
					callback(err);
				}
			}
			db.end();
		});
	}
	
}

Subscription.unsub = function(follower_id, target_id, callback)
{
	var db = connect();
	db.query('DELETE FROM subscriptions WHERE follower_id=? AND target_id=?', [follower_id, target_id], function(err){
		if (err){
			console.log(err);
		}
		if (callback) callback(err);
	});
	db.end();
}

Subscription.exists = function(follower_id, target_id, callback)
{
	var db = connect();
	db.query('SELECT * FROM subscriptions WHERE follower_id=? AND target_id=?', [follower_id, target_id], function(err, rows){
		if (err){
			console.log(err);
			callback(err, false);
		}
		else {
			callback(err, (rows.length==1));
		}
	})
}

Subscription.getAllForUser = function(user_id, callback)
{
	var db = connect();
	db.query('SELECT * FROM subscriptions WHERE follower_id=?', [user_id], function(err, rows){
		if (err){
			console.log(err);
			callback(err);
			return;
		}
		var subs=[];
		for (i=0; i < rows.length; i++){
			subs.push(rows[i].target_id);
		}
		db.end();
		callback(err, subs);
	});
}

Subscription.getAllSubscribers = function(user_id, callback)
{
	var db = connect();
	db.query('SELECT * FROM subscriptions WHERE target_id = ?', [user_id], function(err, rows){
		if (err){
			console.log(err);
			callback(err);
			return;
		}
		var subs = [];
		for (i=0; i<rows.length; i++){
			subs.push(rows[i].follower_id);
		}
		callback(err, subs);
	});
}

Subscription.makeSubscriptions = function(user_id, id_list, callback)
{
	var db = connect();
	var count = 0;

	var then = function(){
		count++;
		if (count == id_list.length){
			callback();
		}
	}

	var forEachSub = function(id){
		var sub = new Subscription(user_id, id);
		sub.save(function(err){
			if (err){
				callback(err);
				return;
			}
			then();
		});
	}

	for (i=0; i<id_list.length; i++){
		forEachSub(id_list[i]);
	}


}

Subscription.clear = function(callback)
{
	var db = connect();
	db.query('DELETE FROM subscriptions', callback);
	db.end();
}

module.exports = Subscription;
