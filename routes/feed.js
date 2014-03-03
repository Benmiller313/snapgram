var Photo = require('../models/photo');
var date_diff = require('../date_diff');
var User = require('../models/user');
var Subscription = require('../models/subscription');
var Feed = require('../models/feed');
var url = require('url');

exports.userFeed = function(req, res){
	console.log('fuck');
	var user = req.session.user;
	Photo.getAllForUser(user.id, function(err, photos){
		if (err) {
			res.send(err);
			return;
		}
		//now get all photos in the feed table
		Feed.getFeedForUser(user.id, function(err, feed_photos){
			console.log('photos:');
			console.log(feed_photos);
			photos = photos.concat(feed_photos);
			photos = photos.sort(function(a, b){
				return b.date.getTime() - a.date.getTime();
			});
			//Got the photos, but we need to match them up with a user. 
			formatted_photos = [];
			var count = 0;
			var then = function(){
				count++;
				if (count == photos.length){
					res.render('feed', {
						title : 'SnapGram: Stream',
						user : req.session.user,
						photos : formatted_photos,
					});
					return;
				}
			}
			var forEachPhoto = function(photo, index){
				User.getById(photo.user_id, function(err, photo_owner){
					if (err) {
						res.send(err);
						return;
					}
					formatted_photos[index] = {
						path : photo.id+ "." + photo.type,
						time : photo.date.time_ago_in_words() + " ago",
						name : photo_owner.name,
						id : photo_owner.id
					};
					then();
				});
			}
			if (photos.length==0){
				res.render('feed', {
					title : 'SnapGram: Stream',
					user : req.session.user,
					photos : formatted_photos,
				});
				return;
			}
			for (i=0; i<photos.length; i++){
				forEachPhoto(photos[i], i);
			}
		});
		
	});
}

exports.userStream = function(req, res, next){
	User.getById(req.params.id, function(err, user){
		if (err) {
			res.send(err);
			return;
		}
		if (!user){
			next();	//404
			return;
		}
		console.log(user);

		Photo.getAllForUser(req.params.id, function(err, photos){
			if (err) {
				res.send(err);
				return;
			}
			photos = photos.sort(function(a, b){
				return b.date.getTime() - a.date.getTime();
			});
			formatted_photos = [];
			for (i=0; i<photos.length; i++){
				formatted_photos.push({
					path : photos[i].id+ "." + photos[i].type,
					time : photos[i].date.time_ago_in_words() + " ago",
					name : user.name,
					id : user.id
				})
			}
			Subscription.exists(req.session.user.id, user.id, function(err,yes){
				if (err){
					res.send(err);
					return;
				}
				res.render('stream', {
							title : 'SnapGram: Stream',
							user : req.session.user,
							stream_id : req.params.id,
							photos : formatted_photos,
							follow : yes 
						});
			});
		});
	});
}

exports.sub = function(req, res, next)
{
	if (req.params.sub == 'follow') {
		console.log('following');
		var subscription  = new Subscription(req.session.user.id, req.params.id);
		console.log(subscription);
		subscription.save(function(err){
			if (err){
				res.send(err);
			}
			else{
				res.redirect('/users/'+req.params.id);
			}
		});
	}
	else if (req.params.sub == 'unfollow') {
		//delete subscription
		Subscription.unsub(req.session.user.id, req.params.id, function(err){
			if (err){
				res.send(err);
			}
			else {
				res.redirect('/users/'+req.params.id);
			}
		});
	}
	else {
		next();	//404
	}
}