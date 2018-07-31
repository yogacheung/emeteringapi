/*************************************
* Name: eMetering - server.js        *
* Version: 1.0.0                     *
* Node Module: hapi, mysql, md5, joi *
* Date: 15 June 2018                 *
* By Yoga Cheung                     *
**************************************/

///////////////////////////////////////////////////////////
/* DEFINE */
///////////////////////////////////////////////////////////

const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const Lout = require('lout');

var md5 = require('md5');
var Joi = require('joi');
var db = require('./mysql.js');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    secureConnection: true, // use SSL
    port: 465, // port
    auth: {
      user: 'yauka0215@gmail.com',
      pass: 'cyk910215'
    }
});

var log = console.log.bind(console);
const server = Hapi.Server({ 
  port: 3000,
  host: 'localhost',
  routes: {cors: true}
});

const init = async () => {
  await server.register(Vision);
  await server.register(Inert);
  await server.register(Lout);
  await server.start();

  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

///////////////////////////////////////////////////////////
/* TEST */
///////////////////////////////////////////////////////////

server.route({
    method: 'GET',
    path: '/test',
    handler: (request, h) => {
      return 'This is test route!';
    }
});

///////////////////////////////////////////////////////////
/* ERROR LOG */
///////////////////////////////////////////////////////////

// If needed

///////////////////////////////////////////////////////////
/* ADMIN */
///////////////////////////////////////////////////////////

// Login
server.route({
  method: 'POST',
  path: '/login',
  handler: (request, h) => {
    var data = request.payload;
    log(data);
    return new Promise((resolve, reject) => {
      db.login(data, function(err, result){
        if (err == null) return resolve(result);
        else return resolve(err);      
      });
  });
  }
});

// Update Password
server.route({
  method: 'POST',
  path: '/updatepw',
  handler: (request, h) => {
    var data = request.payload;
    //log(data);
    return new Promise((resolve, reject) => {
      db.updatePW(data, function(err, result){
        if (err == null) return resolve({"msg":"Success"});
        else return resolve(err);      
      });
    });
  }
});

// Reset Password
server.route({
  method: 'POST',
  path: '/resetpw',
  handler: (request, h) => {
    var data = request.payload;
    //log(data);
    return new Promise((resolve, reject) => {
      db.updatePW(data, function(err, result){
        if (err == null) return resolve({"msg":"Success"});
        else return resolve(err);      
      });
    });
  }
});

///////////////////////////////////////////////////////////
/* UNIT LIST */
///////////////////////////////////////////////////////////

server.route({
  method: 'GET',
  path: '/unitlist',
  handler: (request, h) => {
    return new Promise((resolve, reject) => {
      db.unitlist(function(err, list){  
        //log(list);
        if(err == null) return resolve(list);
          else return resolve(err);
      });
    });
  }
});

///////////////////////////////////////////////////////////
/* READING */
///////////////////////////////////////////////////////////

// Current reading
server.route({
  method: 'GET',
  path: '/currentreading',
  handler: (request, h) => {
    return new Promise((resolve, reject) => {
      db.currentReading(function(err, list){  
        //log(list);
        if(err == null) return resolve(list);
          else return resolve(err);
      });
    });
  }
});

// Montly reading
server.route({
  method: 'GET',
  path: '/genreport/{id*2}',  
  handler: (request, h) => {
    var id = request.params.id.split('/');

    var startDate = id[0];
    var cutoffDate = id[1];          
    return new Promise((resolve, reject) => {
      db.genReport(startDate, cutoffDate, function(err, list){
        //log(list);
        if(err == null) return resolve(list);
        else return resolve(err);
      });    
    });
  }
});

///////////////////////////////////////////////////////////
/* REPORT */
///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
/* GRAPH */
///////////////////////////////////////////////////////////

// Gernal Info
server.route({
  method: 'GET',
  path: '/unitinfo/{unit}',
  handler: (request, h) => {
    var unit = request.params.unit;    
    return new Promise((resolve, reject) => {
      db.unitInfo(unit, function(err, result){  
        // log(result);
        if(err == null) return resolve(result);
          else return resolve(err);
      });
    });
  }
});

// Last N Days
server.route({
  method: 'GET',
  path: '/lastndays/{id*2}',
  handler: (request, h) => {
    var id = request.params.id.split('/');
    var unit = id[0];
    var days = id[1];
    
    return new Promise((resolve, reject) => {
      db.lastNDays(unit, days, function(err, result){  
        //log(result);
        if(err == null) return resolve(result);
          else return resolve(err);
      });
    });
  }
});

//------------------------ END --------------------------//
