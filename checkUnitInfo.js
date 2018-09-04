/*************************************
* Name: eMetering - Check Unit Info  *
* Version: 1.0.0                     *
* Node Module: mysql                 *
* Date: 3 September 2018             *
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
    var sql = "SELECT Unit, MAX(Datetime) AS Datetime FROM readings GROUP BY Unit;";
    con.query(sql, function (err, list) {
      if (err) throw err;
      //console.log("Result: " + list);
      if(list){
        for (i in list) {
          var sql2 = "UPDATE unit_info SET Prev_datetime = Curr_datetime, Curr_datetime = ? WHERE Unit = ?;";
          con.query(sql2, [list[i].Datetime, list[i].Unit], function (err, res) {
            if (err) throw err;
            //console.log("Result: " + res);            
          }); 
        }
      }            
      // con.end();
      console.log("Closed!");
    });
});