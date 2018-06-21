/*************************************
* Name: eMetering - mysql.js         *
* Version: 1.0.0                     *
* Node Module: hapi, mysql, md5, joi *
* Date: 15 June 2018                 *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* DEFINE */
///////////////////////////////////////////////////////////

var mysql = require('mysql');
var log = console.log.bind(console);

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'weshallovercomesomeday',
  database: 'eMeter'
});

exports.query = pool.query.bind(pool);

///////////////////////////////////////////////////////////                                              
/* ERROR LOG */                                                                                          
///////////////////////////////////////////////////////////                                              
          
// If needed

///////////////////////////////////////////////////////////
/* ADMIN */
///////////////////////////////////////////////////////////

// Login
exports.login = function(data, callback) {
  var stmt = "SELECT user_id FROM account WHERE name = ? AND password = ?;";
  pool.query(stmt, [data.name, data.password], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Update Password
exports.updatePW = function(data, callback){
  var stmt = "UPDATE account SET password = ? WHERE name = ? AND password = ?;";
  pool.query(stmt, [data.newpassword, data.name, data.oldpassword], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* READING */
///////////////////////////////////////////////////////////

// Current reading
exports.currentReading = function(callback) {
  var stmt = "SELECT Unit, MAX(Reading) AS 'Reading' FROM readings WHERE Remarks = 'R' GROUP BY Unit;";
  pool.query(stmt, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Montly reading
exports.monthlyReading = function(StartDate, EndDate, callback) {
  var stmt = "SELECT r1.Date AS StartDate, r2.Date AS EndDate, r1.Unit, r2.Reading - r1.Reading AS Reading FROM daily_last_reading r1, daily_last_reading r2 WHERE r1.Unit = r2.Unit AND (r1.Unit, r1.Date) IN (SELECT Unit, MIN(Date) FROM daily_last_reading WHERE Date BETWEEN ? AND ? GROUP BY Unit) AND r2.Date = ? ORDER BY r1.Unit;";
  pool.query(stmt, [StartDate, EndDate, EndDate], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

//------------------------ END --------------------------//
