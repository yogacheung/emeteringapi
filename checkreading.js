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
    var sql = "SELECT ID, Unit, Max(Reading) AS Reading FROM readings WHERE Remarks = 'R' GROUP BY Unit;";
    con.query(sql, function (err, list) {
      if (err) throw err;
      //console.log(list);
    
      for(var i in list){
        if(list[i].Reading > 999999){
          console.log(list[i].ID, list[i].Reading);        
          var newsql = "UPDATE readings SET Reading = 0.0 WHERE ID = "+list[i].ID;
          console.log(list[i].ID, newsql);
          con.query(newsql, function (err, result) {
            if (err) throw err;
            //console.log(result);                                  
          });
        }
      }            
      console.log("Closed!");      
    });
});