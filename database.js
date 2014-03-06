mysql = require('mysql');
conn = mysql.createConnection({
  host: 'web2.cpsc.ucalgary.ca',
  user: 's513_bamiller',
  password: '10015748',
  database: 's513_bamiller'
});

conn.connect();

conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

conn.end();
