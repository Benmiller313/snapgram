mysql = require('mysql');
conn = mysql.createConnection({
  host: 'web2.cpsc.ucalgary.ca',
  user: 's513_ben.miller',
  password: '10015748',


});

conn.connect();

conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

conn.query('USE s513_bamiller', function(err, rows){
	console.log(err);
	console.log(rows);
	console.log(rows[0]);
})
conn.end();
