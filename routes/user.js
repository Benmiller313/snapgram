var crypto = require('crypto');

/*
 * GET users listing.
 */
var mysql = require('../node_modules/mysql');

var User = require('../models/user.js');




exports.list = function(req, res)
{
  res.send("respond with a resource");
};

exports.registration = function(req, res)
{
	res.render('registration', {
		title: 'SnapGram: Register',
		first_name_error : req.session.form_errors_first_name,
		last_name_error : req.session.form_errors_last_name,
		username_error : req.session.form_errors_username,
		password_error : req.session.form_errors_password
	});
	delete req.session.form_errors_first_name;
	delete req.session.form_errors_last_name;
	delete req.session.form_errors_username;
	delete req.session.form_errors_password;
};

exports.create = function(req, res)
{
	//validate form:
	var error = false;
	delete req.session.form_errors_first_name;
	delete req.session.form_errors_last_name;
	delete req.session.form_errors_username;
	delete req.session.form_errors_password;
	if(!req.body.firstname){
		req.session.form_errors_first_name = "Please enter your first name.";
		error = true;
	}
	if(!req.body.lastname){
		req.session.form_errors_last_name = "Please enter your last name.";
		error = true;
	}
	if(!req.body.username){
		req.session.form_errors_username = "Please enter a username";
		error = true;
	}
	if(!req.body.password){
		req.session.form_errors_password = "Please enter a password";
		error = true;
	}
	if (error){
		res.redirect("/users/new");
	}

	User.getByUsername(req.body.username, function(err, users){
		if (err){
			res.send(err);
			return;
		}
		if (users.length > 0){
			req.session.form_errors_username = "Your username is already taken.";
			res.redirect("/users/new");
			return;
		}
		var hashed_pass = crypto.createHash('sha256').update(req.body.password).digest('hex');
		user = new User(req.body.firstname + " " + req.body.lastname, req.body.username, hashed_pass);
		user.save(function(err){
			if (err) {
				res.send(err);
				return;
			}
			req.session.user = user;
			res.redirect('/feed');
		});
	});
};

