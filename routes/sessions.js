
var User = require('../models/user');


exports.login = function(req, res)
{
	console.log('yup');
	res.render('login', {
		title : "SnapGram: Login",
		username_error : req.session.form_errors_username,
		password_error : req.session.form_errors_password,
		login_validation_error : req.session.login_validation_error
	});
	delete req.session.form_errors_username;
	delete req.session.form_errors_password;
	delete req.session.login_validation_error;
}

exports.create =function(req, res)
{
	console.log('login');
	//validate the form
	var error = false;
	delete req.session.form_errors_username;
	delete req.session.form_errors_password;

	if(!req.body.username){
		req.session.form_errors_username = "Please enter your username";
		error = true;
	}
	if(!req.body.password){
		console.log('goo');
		req.session.form_errors_password = "Please enter your password";
		error = true;
	}

	if (error){
		res.redirect('/sessions/new');
		return;
	}

	//validate in database

	console.log('validate');
	User.login(req.body.username, req.body.password, function(err, validation_error, user){
		console.log('in user');
		if (err){
			console.log(err);
			res.send('error');
		}
		else if (!user){
			//Couldnt be logged in
			console.log(validation_error);
			req.session.login_validation_error = validation_error;
			res.redirect('sessions/new');
		}
		else{
			if (!user.id){
				console.log("Error: no id");
			}
			req.session.user = user;
			res.redirect('/feed');
		}
	});
}

exports.logout = function(req, res)
{
	req.session.destroy();	//logout.
	res.redirect('/');
}