var Photo = require('../models/photo');
var Feed = require('../models/feed');

var gm = require('gm');
var imagemagick = require('imagemagick');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });

var allowed_types = {
	jpeg : 'jpg',
	gif : 'gif',
	png : 'png'
}

exports.add = function(req, res)
{ 
	res.render('photo_upload', {
		title : 'SnapGram: Upload', 
		user : req.user,
		file_error : req.session.file_upload_error
	});
	console.log(req.session.file_upload_error);
	delete file_upload_error;
}

exports.create = function(req, res, next)
{
	//verify form 
	if(!req.files){
		req.session.file_upload_error = 'No file selected';
		res.redirect('/photos/new');
		return;
	}
	var type = req.files.file_select.type.split('/')[1];
	if (allowed_types[type]){
		type = allowed_types[type]; //The actual extension 'jpg, gif...'
	}
	else {
		//unnacceptable type
		fs.unlink(req.files.file_select.path, function(err){
			if (err){
				next(err);
			}
		});
		req.session.file_upload_error = 'File must be an image';
		res.redirect('/photos/new');
	}

	// make a new file record and rename the image to reflect the id. 
	var photo = new Photo(req.session.user.id, type);
	photo.save(function(err){
		console.log('id: ' + photo.id);
		if(err){
			next(err);
			return;
		}
		fs.rename(req.files.file_select.path, 'images/' + photo.id + '.' + type, function(err){
			if(err){
				next(err);
			}

			//Update all feeds as well. Can send the redirect before it completes. 
			Feed.updateFeeds(req.session.user.id, photo.id, function(err){
				if (err){
					next(err);
					return;
				}
				res.redirect('/feed');
			});
		});
	});
}

exports.serve = function(req, res, next){
	var path = "images/" + req.params.id + '.' + req.params.ext;
	console.log(path);
	if(!fs.existsSync(path)){
		next("Requested image not found on server.");
		return;
	}

	var img = gm(path);
	img.toBuffer(function(err, buffer){
				if(err) console.log(err);
				res.writeHead(200, {
	      			'Content-Type' : 'image/png',
	      			'Content-Length' : buffer.length});
				res.write(buffer);
				res.end('\n');
	});
}

exports.serveThumb = function(req, res){
	var path = "images/" + req.params.id + '.' + req.params.ext;
	console.log(path);
	if(!fs.existsSync(path)){
		next("Requested image not found on server.");
		return;
	}

	var img = gm(path).resize(400);
	img.toBuffer(function(err, buffer){
				if(err) console.log(err);
				res.writeHead(200, {
	      			'Content-Type' : 'image/png',
	      			'Content-Length' : buffer.length});
				res.write(buffer);
				res.end('\n');
	});
}
