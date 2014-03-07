var mysql = require('mysql');

exports.connect = function()
{
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : '', 
		database : 'snapgram_db'
	});
	connection.connect();
	return connection;
}