var Photo = require('../models/photo'),
	Subscription = require('../models/subscription'),
	User = require('../models/user'),
	Feed = require('../models/feed'),
	crypto = require('crypto');


exports.clear = function(req, res)
{
	var models = [Photo, Subscription, User, Feed,];
	var count = 0;
	
	var jobDone = function()
	{
		res.send('DB cleared.');
	}

	var clearModel = function(model)
	{
		model.clear(function(err){
			if (err){
				res.send(err);
			}
			count++;
			if (count == models.length){
				jobDone();
			}
		})
	}

	for (i=0; i< models.length; i++){
		//for each model
		clearModel(models[i]);
	}	
}

exports.users = function(req, res)
{
	var count = 0;
	var users = req.body;

	var jobDone = function()
	{
		count++;
		if (count == users.length){
			res.send(count + ' Users Created\n');
		}
	}

	var createUser = function(data)
	{
		console.log(data)
		var hashed_pass = crypto.createHash('sha256').update(data.password).digest('hex');
		var user = new User(data.name, data.name, hashed_pass, data.id)
		user.saveForceId(function(err){
			if (err){
				res.send(err);
				return;
			}
			//create feeds
			Subscription.makeSubscriptions(user.id, data.follows, function(err){
				if (err){
					res.send(err);
					return;
				}
				jobDone();
			});
		});
	}

	for (i=0;i<users.length;i++){
		createUser(users[i]);
	}
}