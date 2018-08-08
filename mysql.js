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
  //password: 'weshallovercomesomeday',
  password: 'yoga@0101',
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
  var stmt = "SELECT user_id FROM account WHERE name = ? AND password = MD5(?);";
  pool.query(stmt, [data.name, data.password], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Update Password
exports.updatePW = function(data, callback){
  var stmt = "UPDATE account SET password = ? WHERE user_id = ? AND name = ? AND password = ?;";
  pool.query(stmt, [data.newpassword, data.user_id, data.name, data.oldpassword], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Reset Account to Default
exports.resetAccount = function(data, callback){
  var stmt = "UPDATE account SET name = 'meter', password = MD5('abcd@1234') WHERE user_id = 1;";
  pool.query(stmt, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* UNIT LIST */
///////////////////////////////////////////////////////////

exports.unitlist = function(callback) {
  var stmt = "SELECT DISTINCT Unit FROM readings;";
  pool.query(stmt, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* READING */
///////////////////////////////////////////////////////////

// Current reading
exports.currentReading = function(callback) {
  var stmt = "SELECT Unit, MAX(Reading) AS 'Reading', DATE_FORMAT(MAX(Datetime), '%d %b %y %H:%i:%S') AS 'Datetime' FROM readings WHERE Remarks = 'R' GROUP BY Unit;";
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

///////////////////////////////////////////////////////////
/* REPORT */
///////////////////////////////////////////////////////////

// Montly reading
exports.genReport = function(startDate, cutoffDate, callback) {
  var stmt = "SELECT r1.Unit, DATE_FORMAT(r1.Date, '%d %b %y') AS 'StartDate', DATE_FORMAT(r2.Date, '%d %b %y') AS 'CutOffDate', r2.Reading - r1.Reading AS 'Reading' FROM daily_last_reading r1, daily_last_reading r2 WHERE r1.Unit = r2.Unit AND (r1.Unit, r1.Date) IN (SELECT Unit, MIN(Date) FROM daily_last_reading WHERE Date BETWEEN ? AND ? GROUP BY Unit) AND r2.Date = ? ORDER BY r1.Unit;";
  pool.query(stmt, [startDate, cutoffDate, cutoffDate], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* GRAPH */
///////////////////////////////////////////////////////////

// Gernal Info
exports.unitInfo = function(unit, callback) {
  var stmt = "SELECT Unit, MAX(Reading) AS 'Maxread', MIN(Reading) AS 'Minread', MAX(Reading) - MIN(Reading) AS 'Accum' FROM readings WHERE Remarks = 'R' and Unit = ?;";
  pool.query(stmt, unit, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Last N Days
exports.lastNDays = function(unit, days, callback) {
  var stmt = "SELECT Unit, DATE_FORMAT(Date, '%d %b %y') AS 'Date', DATE_FORMAT(Date, '%a') AS 'Week', Reading FROM daily_last_reading WHERE Unit = ? ORDER BY Date DESC LIMIT " + days + ";";
  pool.query(stmt, unit, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Last Month Reading
exports.unitMonthReading = function(unit, callback) {
  var stmt = "SELECT Unit, Date, Reading FROM `daily_last_reading` WHERE Unit = '10A01' AND Date BETWEEN NOW() - INTERVAL 1 MONTH AND NOW() ORDER BY Date;";
  pool.query(stmt, unit, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

//------------------------ END --------------------------//
