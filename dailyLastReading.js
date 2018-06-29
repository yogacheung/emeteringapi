/*************************************
* Name: eMetering - dailyLastReading *
* Version: 1.0.0                     *
* Node Module: mysql                 *
* Date: 15 June 2018                 *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* DEFINE */
///////////////////////////////////////////////////////////

var mysql = require('mysql');
var log = console.log.bind(console);

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'weshallovercomesomeday',
    database: 'eMeter'
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO daily_last_reading(Date, Unit, Reading) SELECT date_format(Datetime, '%Y-%m-%d'), Unit, MAX(Reading) FROM readings WHERE Remarks = 'R' AND date_format(Datetime, '%Y-%m-%d') = CURRENT_DATE - INTERVAL 1 DAY GROUP BY Unit;";
    con.query(sql, function (err, result) {
      if (err) throw err;
      //console.log("Result: " + result);
      con.end();
      console.log("Close!");
    });
});