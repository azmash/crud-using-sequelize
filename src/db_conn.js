const mysql = require('mysql');
const conn = require('../conf/config');
const con = mysql.createConnection({
  host: conn.db.host,
  user: conn.db.user,
  password: conn.db.password,
  database: conn.db.database
});

module.exports = con;