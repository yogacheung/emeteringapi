/*************************************
* Name: eMetering - check reading    *
* Version: 1.0.0                     *
* Node Module: mysql                 *
* Date: 15 June 2018                 *
* By Yoga Cheung                     *
**************************************/


// 59 * * * * /usr/local/bin/node /var/www/emeteringapi/checkreading.js
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
    var now = new Date().toISOString().slice(0,10);  
    console.log(now);  
    var sql = "SELECT Unit, AVG(Reading) AS 'Avg' FROM readings WHERE Remarks = 'R' AND DATE_FORMAT(Datetime,'%Y-%m-%d') = ? GROUP BY Unit;"; 
    con.query(sql, now, function (err, list) {
      if (err) throw err;         
      for(var i in list){
      	// console.log(list[i]);
        // var sql2 = "SELECT * FROM `readings` WHERE Remarks = 'R' AND Reading > ? AND Unit = ? AND DATE_FORMAT(Datetime,'%Y-%m-%d') = ?;"      	
        var sql2 = "UPDATE readings SET Remarks = 'NR' WHERE Remarks = 'R' AND Reading > ? AND Unit = ? AND DATE_FORMAT(Datetime,'%Y-%m-%d') = ?;";      	
        con.query(sql2, [list[i].Avg*3, list[i].Unit, now], function (err, res) {
  	      if (err) throw err; 	
  	      console.log(res);      
	    });
      }            
      console.log("Closed!");      
    });
});