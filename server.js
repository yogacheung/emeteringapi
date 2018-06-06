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

var Hapi = require('hapi');
var md5 = require('md5');
var Joi = require('joi');
var db = require('./mysql.js');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    secureConnection: true, // use SSL
    port: 465, // port
    auth: {
      user: 'sizingenquiry.fiture@gmail.com',
      pass: 'fiture2017'
    }
});

//var log = console.log.bind(console);
var server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([require('vision'), require('inert'), { register: require('lout') }], function(err) {
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

///////////////////////////////////////////////////////////
/* ERROR LOG */
///////////////////////////////////////////////////////////

server.route({
  method: 'POST',
  path: '/errorlog',
  config:{
    validate:{
      payload:{        
        user_id: Joi.number().min(0).required(),
        msg: Joi.string().required()
      }
    }
  },
  handler: function (request, reply){
	var data = request.payload;
  	db.addErrorLog(data, function(err, result){
	  	if(err == null) reply({"msg":'Success'});
      else reply(err);
	  });
  }
});

///////////////////////////////////////////////////////////
/* ADMIN */
///////////////////////////////////////////////////////////

// Login
server.route({
  method: 'POST',
  path: '/adminlogin',
  handler: function (request, reply) {
    var data = request.payload;
    db.adminlogin(data, function(err, result){
      if (err == null) reply(result);
      else reply(err);
      
    });
  }
});

///////////////////////////////////////////////////////////
/* User Login - app.fiture */
///////////////////////////////////////////////////////////

// Login
server.route({
  method: 'POST',
  path: '/applogin',
  handler: function (request, reply) {
    var data = request.payload;
    db.userlogin(data, function(err, result){
      if (err == null) reply(result);
      else reply(err);
      
    });
  }
});

server.route({
  method: 'POST',
  path: '/appregister',
  handler: function (request, reply) {
    var data = request.payload;
    var email = data.email;
    db.usercheck(email, function(err, result){
      if (err == null){
	    if (result.length < 1){
		    db.userregister(data, function(err, result2){
			    if (err == null) reply(result2);
				else reply(err);
			});
	    }else {
		    reply(0);
	    }
	  }else reply(err);
      
    });
  }
});


///////////////////////////////////////////////////////////
/* APN */
///////////////////////////////////////////////////////////

// Push Notification - Save Devices
server.route({
  method: 'POST',
  path: '/adddevice',
  config:{
    validate:{
      payload:{
        token: Joi.string().required(),
        user_id: Joi.number().min(0)
      }
    }
  },
  handler: function (request, reply){
    var data = request.payload;
    var userid = data.user_id;
    
    db.checkUserDevice(userid, function(err, result){
      if(result[0] != null){
        db.updateUserDevice(data, function(err, res){
          if(err == null) reply({"msg":'Success'});
          else reply(err);
        }); 
      }else {
        db.addUserDevice(data, function(err, res){
          if(err == null) reply({"msg":'Success'});
          else reply(err);
        }); 
      }
    });
 
  }
});

// Push Notification - Send
server.route({
  method: 'GET',
  path: '/apn/{id*2}',
  handler: function (request, reply){
    var id = request.params.id.split('/');
   
  var message;
  
    switch(id[0]){
      case '1':{
        message = "Find More New Brands!";
        break;
      }
      case '2':{
        db.getCode(id[1], function(err, code){
          if(err == null){
            message = "Get Your Promo Code " + code[0].code;
          }else reply(err);
        });
        break;
      }
      case '3':{
        message = "Check Out With Discount Now!";
        break;
      }
      case '4':{
        message = "Update Your Size To Get Accurate Sugguestion.";
        break;
      }
      case '5':{
        message = "Thank you for joining Fiture Lucky Draw!";
        break;
      }
      case '6':{
        message = "Updated with new products! Check them out now.";
        break;
      }
    }

    db.getDevice(function(err, token){
      if(err == null) {
        var options = {
        cert: '/srv/www/app.fiture.net/apn/apn-cert.pem', 
        key: '/srv/www/app.fiture.net/apn/apn-key.pem', 
        gateway: 'gateway.push.apple.com',
        passphrase:'pass',
        errorCallback: errorHappened
      }; 
  
      function errorHappened(err, notification){
        // console.log("err " + err);
        reply({"msg": err});
      }
        
        for(i in token){
          var myToken = token[i].token;
          var myDevice = new apn.Device(myToken);
          var apnConnection = new apn.Connection(options);

          var note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 1;
          note.sound = "ping.aiff";
          note.alert = message;
          note.payload = {'messageFrom': 'Fiture'};
          note.device = myDevice;

          apnConnection.sendNotification(note);
          apnConnection.shutdown();
        }  
        
        reply(token);                    
      }else reply(err);
    });

  }
});

///////////////////////////////////////////////////////////
/* BODY SIZE - app.fiture */
///////////////////////////////////////////////////////////

// User Body Size - add user size
server.route({
  method: 'POST',
  path: '/addbodysizea',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        gender: Joi.string().regex(/^[M|F]$/),
        height: Joi.number().min(0).max(299),
        weight: Joi.number().min(0).max(299),
        top_length: Joi.number().min(0).max(199),
        bottom_length: Joi.number().min(0).max(199),
        neck : Joi.number().min(0).max(90),
        shoulder: Joi.number().min(0).max(150),
        chest: Joi.number().min(0).max(199),
        waist: Joi.number().min(0).max(199),
        low_waist: Joi.number().min(0).max(199),
        sleeve_length: Joi.number().min(0).max(199),
        hip: Joi.number().min(0).max(199),
        rise: Joi.number().min(0).max(199),
        thigh: Joi.number().min(0).max(99),
        calves: Joi.number().min(0).max(99),
        footwear: Joi.number().min(0).max(99)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload; 
    db.addUserBodySizeA(data, function(err, user_size_id){
		if(err == null) reply({"msg":'Success'});
		else reply(err);
    });
  }
});

// User Body Size - get user size
server.route({
  method: 'GET',
  path: '/getbodysizea/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getUserBodySizeA(user_id, function(err, bodySize){
      if(err == null) reply(bodySize);
      else reply(err);
    });
    
  }
});

///////////////////////////////////////////////////////////
/* BODY SIZE */
///////////////////////////////////////////////////////////

// User Body Size - add user size
server.route({
  method: 'POST',
  path: '/addbodysize',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        gender: Joi.string().regex(/^[M|F]$/),
        height: Joi.number().min(0).max(299),
        weight: Joi.number().min(0).max(299),
        top_length: Joi.number().min(0).max(199),
        bottom_length: Joi.number().min(0).max(199),
        neck : Joi.number().min(0).max(90),
        shoulder: Joi.number().min(0).max(150),
        chest: Joi.number().min(0).max(199),
        waist: Joi.number().min(0).max(199),
        low_waist: Joi.number().min(0).max(199),
        sleeve_length: Joi.number().min(0).max(199),
        hip: Joi.number().min(0).max(199),
        rise: Joi.number().min(0).max(199),
        thigh: Joi.number().min(0).max(99),
        calves: Joi.number().min(0).max(99),
        footwear: Joi.number().min(0).max(99)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;    
    db.addUserBodySize(data, function(err, user_size_id){
			if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// User Body Size - add user size
server.route({
  method: 'POST',
  path: '/addsize2',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        gender: Joi.string().regex(/^[M|F]$/),
        height: Joi.number().min(0).max(299),
        weight: Joi.number().min(0).max(299),
        shoulder: Joi.number().min(0).max(150),
        chest: Joi.number().min(0).max(199),
        waist: Joi.number().min(0).max(199),
        hip: Joi.number().min(0).max(199),
        thigh: Joi.number().min(0).max(99),
        calves: Joi.number().min(0).max(99),
        footwear: Joi.number().min(0).max(99)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;    
    db.addUserSize(data, function(err, user_size_id){
			if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// User Body Size - get user size
server.route({
  method: 'GET',
  path: '/size/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getUserSize(user_id, function(err, size){
      if(err == null) reply(size);
      else reply(err);
    });
    
  }
});

// User Body Size - get user size
server.route({
  method: 'GET',
  path: '/getbodysize/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getUserBodySize(user_id, function(err, bodySize){
      if(err == null) reply(bodySize);
      else reply(err);
    });
    
  }
});

///////////////////////////////////////////////////////////
/* CLICK RATE */
///////////////////////////////////////////////////////////

// Code Click Rate
server.route({
  method: 'GET',
  path: '/codeclick/{code_id}',
  config:{
    validate:{
      params:{
        code_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var code_id = request.params.code_id;
    db.codeClick(code_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// Worldwide Click Rate
server.route({
  method: 'GET',
  path: '/worldwideclick/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
    db.worldwideClick(gender, brand_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

// Worldwide Product Click Rate
server.route({
  method: 'GET',
  path: '/wwproductclick/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.WWProductClick(product_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* EMAIL */
///////////////////////////////////////////////////////////

server.route({
  method: 'GET',
  path: '/enquirysize/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');

		dbs.getUserData(id[0], function(err, user){
		    if(err) reply(err);
		    else{
	// 		    reply(user);
			  	db.getproductData(id[1], function(err, product){
			  		if(err) reply(err);
						else{
	// 						reply(product);
								db.getUserSize(id[0], function(err, size){
									if(err) reply(err);
									else{
	// 									reply(size);
											var content = 'Dear Sir/Madam,<br>';
											content += '<br>I want to buy ' + product[0].name;
											content += '<br>Product link: ' + product[0].link;
											content += '<br><br>My size';
											content += '<br>Gender: ' + product[0].prefix;
											content += '<br>Height: ' + size[0].height + ' cm';
											content += '<br>Weight: ' + size[0].weight + ' cm';
											switch(product[0].body_part){
												case 1:{
													if(size[0].shoulder != 0) content += '<br>Shoulder: ' + size[0].shoulder + ' cm';
													if(size[0].chest != 0) content += '<br>Chest: ' + size[0].chest + ' cm';
													if(size[0].waist != 0) content += '<br>Waist: ' + size[0].waist + ' cm';
													break;
												}
												case 2:{
													if(size[0].waist != 0) content += '<br>Waist: ' + size[0].waist + ' cm';
													break;
												}
												case 3:{	
													if(size[0].footwear != 0) content += '<br>Footwear: ' + size[0].footwear + ' cm';
													break;											
												}
											}
											content += '<br><br>What size should I buy? What size will you recommend?';
											//content += '<br><br>Please reply to: ' + user[0].email;
											//content += '<br>And Bcc to: fit@fiture.net<br><br> Thank you very much.<br> Waiting for your reply.';
											content += '<br><br>Best Regards,<br>' + user[0].firstname + ' ' + user[0].lastname;
											
											var mailOptions = {
										    from: 'sizingenquiry.fiture@gmail.com', // sender address
										    to: product[0].email, // list of receivers
										    cc: user[0].email,
										    bcc: 'fit@fiture.net',
										    subject: 'Product Enquiry', // Subject line
										    text: 'From Fiture Limited', // plain text body
										    html: '<b style="color:black;">'+ content +'</b>' // html body
										};
										
										// send mail with defined transport object
										transporter.sendMail(mailOptions, function(error, info){
										    if(error) reply(error);
										    else {
										    		db.addEmailCount(id[0], id[1], function(err, result){
														if(err) reply(err);
										    			else reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent. Reply time is varied which depends on each shop."});	                     
													});
										    }
										});
									}
								});					
			    	}  
			  	});  
		    }	   
	    });		
	} //End of handler
});

///////////////////////////////////////////////////////////
/* FAVOURITE */
///////////////////////////////////////////////////////////

// Add User Favourite Colour
server.route({
  method: 'POST',
  path: '/addfavcolour',
  config:{
    validate:{
      payload:{
        user_id: Joi.number().min(1).required(),
        white: Joi.number().min(0).max(1),
        black: Joi.number().min(0).max(1),
        red: Joi.number().min(0).max(1),
        orange: Joi.number().min(0).max(1),
        yellow: Joi.number().min(0).max(1),
        green: Joi.number().min(0).max(1),
        aqua_green: Joi.number().min(0).max(1),
        navy: Joi.number().min(0).max(1),
        violet: Joi.number().min(0).max(1),
        pink: Joi.number().min(0).max(1),
        brown: Joi.number().min(0).max(1),
        ash: Joi.number().min(0).max(1),
        grey: Joi.number().min(0).max(1),
        sky_blue: Joi.number().min(0).max(1)
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    
    db.addFavColour(data, function(err, fav_colour_id){
      if(err == null) reply({"fav_colour_id":fav_colour_id});
      else reply(err);
    });

  }
});

// Get User Favourite Colour
server.route({
  method: 'GET',
  path: '/getfavcolour/{user_id}',
  config:{
    validate:{
      params:{
        user_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply) {
    var user_id = request.params.user_id;
    
    db.getFavColour(user_id, function(err, colour){
      if(err == null ) reply(colour);
      else reply(err);
    });

  }
});

///////////////////////////////////////////////////////////
/* FILTER */
///////////////////////////////////////////////////////////

// Get Filter List
server.route({
  method: 'GET',
  path: '/getfilter',
  handler: function (request, reply) {    
    db.filterList(function(err, filter){
      if(err == null ) reply(filter);
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* GUEST ACCOUNT */
///////////////////////////////////////////////////////////

// Add Guest When Login
server.route({
  method: 'POST',
  path: '/addguest',
  config:{
    validate:{
      payload:{
        gender: Joi.string().regex(/^[M|F]$/),
        token: Joi.string().required()
      }
    }
  },
  handler: function (request, reply){
    var data = request.payload;
    db.addGuest(data, function(err, guest_id){
      if(err == null) reply({"guest_id":guest_id});   
      else reply(err);
    });
  }
});

// Update Guest When Logout
server.route({
  method: 'POST',
  path: '/updateguest/{guest_id}',
  config:{
    validate:{
      params:{
        style_id: Joi.string().regex(/^\d{1,11}$/).required()
      }
    }
  },
  handler: function (request, reply){
    var guest_id = request.params.guest_id;
    db.updateGuest(guest_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* SIZE SUGGUESTION */
///////////////////////////////////////////////////////////

//temp
// Get Worldwide Product Size Sugguestion - Body Size
server.route({
  method: 'GET',
  path: '/wwsizesugg2/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
    // id[0] = product_id
    // id[1] = user_id
    db.getUserSuggestSize(id[1], id[0], function(err, result){ //>>1
      if(err != null) reply(err);
      else if(result.length > 0)        
        reply({"size":"YOUR SIZE : " + result[0].size, "action":0, "msg":result[0].size});       
      else {
        db.getUserSize(id[1], function(err, bodysize){ //>>2
          if(err != null) reply(err);
          else if(bodysize.length > 0){
            db.getProductChart(id[0], function(err, product){ //>>3
              if(err != null) reply(err);
              else if(product[0].chart_id == 0){
                db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                  if(err) reply(err);
                  else{ 
                    //reply(enquiry);
                    if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                    else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                    else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                  }
                }); //>>4
              }else {
                db.getBrandSizeChart(product[0].chart_id, product[0].body_part, function(err, sizechart){ //>>5
                  if(err) reply(err);
                  else{ 	                  
                    switch(product[0].body_part){
                      case 1:{
                        var poschest = -1;
                        var poswaist = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 4 && sizechart[i].min < bodysize[0].chest && bodysize[0].chest < sizechart[i].max){
                          poschest = i;
                          }
                          else if(sizechart[i].body_category_id == 5 && sizechart[i].min < bodysize[0].waist && bodysize[0].chest < sizechart[i].max){
                          poswaist = i;
                          }
                        }
                        var respos = poschest;
                        if(poschest < poswaist) respos = poswaist;
                        if(respos > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[respos].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[respos].size, "action":0, "msg":sizechart[respos].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }                
                      break;
                      }
                      case 2:{
                        var poswaist = -1;
                        var poship = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 7 && sizechart[i].min < bodysize[0].hip && bodysize[0].hip < sizechart[i].max){
                          poship = i;
                          }
                          else if(sizechart[i].body_category_id == 5 && sizechart[i].min < bodysize[0].waist && bodysize[0].chest < sizechart[i].max){
                          poswaist = i;
                          }
                        }
                        var respos = poswaist;
                        if(poswaist < poswaist) respos = poswaist;
                        if(respos > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[respos].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[respos].size, "action":0, "msg":sizechart[respos].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }              
                      break;
                      }
                      case 3:{
                        var posfootwear = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 9 && sizechart[i].min < bodysize[0].footwear && bodysize[0].footwear < sizechart[i].max){
                          posfootwear = i;                        
                          }                        
                        }
                        if(posfootwear > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[posfootwear].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[posfootwear].size, "action":0, "msg":sizechart[posfootwear].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }                
                      break;
                      }
                    }
                  }
                }); //>>5
              }                      
            }); //>>3
          }else reply({"size":"LACK OF BODY DATA", "action":-1, "msg":"Need more body data. Update NOW!"});
        }); //>>2                      
      }
    }); //>>1  
  }  
});
//temp

// Get Worldwide Product Size Sugguestion - Body Size
server.route({
  method: 'GET',
  path: '/wwsizesuggest/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/\d{1,11}\/\d{1,11}/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
    // id[0] = product_id
    // id[1] = user_id
    db.getUserSuggestSize(id[1], id[0], function(err, result){ //>>1
      if(err != null) reply(err);
      else if(result.length > 0)        
        reply({"size":"YOUR SIZE : " + result[0].size, "action":0, "msg":result[0].size});       
      else {
        db.getUserBodySize(id[1], function(err, bodysize){ //>>2
          if(err != null) reply(err);
          else if(bodysize.length > 0){
            db.getProductChart(id[0], function(err, product){ //>>3
              if(err != null) reply(err);
              else if(product[0].chart_id == 0){
                db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                  if(err) reply(err);
                  else{ 
                    //reply(enquiry);
                    if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                    else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                    else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                  }
                }); //>>4
              }else {
                db.getBrandSizeChart(product[0].chart_id, product[0].body_part, function(err, sizechart){ //>>5
                  if(err) reply(err);
                  else{ 	                  
                    switch(product[0].body_part){
                      case 1:{
                        var poschest = -1;
                        var poswaist = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 4 && sizechart[i].min < bodysize[0].chest && bodysize[0].chest < sizechart[i].max){
                          poschest = i;
                          }
                          else if(sizechart[i].body_category_id == 5 && sizechart[i].min < bodysize[0].waist && bodysize[0].chest < sizechart[i].max){
                          poswaist = i;
                          }
                        }
                        var respos = poschest;
                        if(poschest < poswaist) respos = poswaist;
                        if(respos > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[respos].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[respos].size, "action":0, "msg":sizechart[respos].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }                
                      break;
                      }
                      case 2:{
                        var poswaist = -1;
                        var poship = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 7 && sizechart[i].min < bodysize[0].hip && bodysize[0].hip < sizechart[i].max){
                          poship = i;
                          }
                          else if(sizechart[i].body_category_id == 5 && sizechart[i].min < bodysize[0].waist && bodysize[0].chest < sizechart[i].max){
                          poswaist = i;
                          }
                        }
                        var respos = poswaist;
                        if(poswaist < poswaist) respos = poswaist;
                        if(respos > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[respos].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[respos].size, "action":0, "msg":sizechart[respos].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }              
                      break;
                      }
                      case 3:{
                        var posfootwear = -1;
                        for(i in sizechart){
                          if(sizechart[i].body_category_id == 9 && sizechart[i].min < bodysize[0].footwear && bodysize[0].footwear < sizechart[i].max){
                          posfootwear = i;                        
                          }                        
                        }
                        if(posfootwear > -1){
                          db.addUserSuggestSize(id[1] , id[0], sizechart[posfootwear].size, function(err, result){ //>>6
                            if(err) reply(err);
                            else{ 
                              reply({"size":" YOUR SIZE : " + sizechart[posfootwear].size, "action":0, "msg":sizechart[posfootwear].size});
                            }
                          }); //>>6
                        }else {
                          db.getEmailCount(id[1], id[0], function(err, enquiry){ //>>4
                            if(err) reply(err);
                            else{ 
                              //reply(enquiry);
                              if(enquiry[0].num < 2 && enquiry[1] == null) reply({"size":"ENQUIRE YOUR SIZE", "action":-2, "msg":"Reply will be sent to your email! Please make sure your email address is correct! Reply time is varied which depends on each shop.\n"+(2-enquiry[0].num)+" chance(s) left!"});                            
                              else if(enquiry[1] != null) reply({"size":"ENQUIRY SENT", "action":-3, "msg":"Enquiry already sent.\n"+(2-enquiry[0].num)+" chance(s) left!"});
                              else if(enquiry[0].num == 2) reply({"size":"ENQUIRY OUT OF LIMITS", "action":-3, "msg":"Out Of Quotas! Only 2 enquiries per day. You can enquire tomorrow."});                   
                            }
                          }); //>>4
                        }                
                      break;
                      }
                    }
                  }
                }); //>>5
              }                      
            }); //>>3
          }else reply({"size":"LACK OF BODY DATA", "action":-1, "msg":"Need more body data. Update NOW!"});
        }); //>>2                      
      }
    }); //>>1  
  }  
});

///////////////////////////////////////////////////////////
/* USER ACTIVITIES */
///////////////////////////////////////////////////////////
server.route({
  method: 'POST',
  path: '/activity',
  config:{
    validate:{
      payload:{
	uuid: Joi.string().regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-5][0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$/).required(),
	action: Joi.string().required()
      }
    }
  },
  handler: function (request, reply) {
    var data = request.payload;
    var xFF = request.headers['x-forwarded-for'];
    var address = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
    db.addActivity(data, address, function(err, activity_id){
      if(err == null) reply(activity_id);
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* WORLDWIDE */
///////////////////////////////////////////////////////////

// Get Brand List
server.route({
  method: 'GET',
  path: '/wwbrandlist/{gender}',
  config:{
    validate:{
      params:{
        gender: Joi.string().regex(/^[M|F|m|f]$/)
      }
    }
  },
  handler: function (request, reply) {
    var gender = request.params.gender;
    db.getWWBrandList(gender, function(err, brandList){
      if(err == null) reply(brandList);
      else reply(err);
    });
  }
});

// Get Product Detail
server.route({
  method: 'GET',
  path: '/wwproductdetail/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.getWWProductDetail(product_id, function(err, product){
      if(err == null) reply(product);
      else reply(err);
    });
  }
});

// Get Product List
server.route({
  method: 'GET',
  path: '/wwproductlist/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^[M|F]\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand = request.params.brand_id;
    var gender = brand.charAt(0);
    var brand_id = brand.substring(1);
    db.getWWProductList(gender, brand_id, function(err, productList){
      if(err == null) reply(productList);
      else reply(err);
    });
  }
});

// Get Product List
server.route({
  method: 'GET',
  path: '/wwproductlist2/{id*2}',
  config:{
    validate:{
      params:{
        id: Joi.string().regex(/^[M|F]\d{1,11}\/\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var id = request.params.id.split('/');
    var gender = id[0].charAt(0);
    var brand_id = id[0].substring(1);
    if(id[1] == 0){
      db.getWWProductListG(gender, brand_id, function(err, productList){
        if(err == null) reply(productList);
        else reply(err);
      });
    }else {
      db.getUserSize(id[1], function(err, userSize){
        if(err != null) reply(err);
        else if(userSize[0] != null){
          db.getWWProductListU(gender, brand_id, userSize[0].it_chart, function(err, productList){
            if(err == null) reply(productList);
            else reply(err);
          });
        }
      });

    }    
  }
});

// Get Related Product List
server.route({
  method: 'GET',
  path: '/wwrelatedproductlist/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.getWWRelatedProductData(product_id, function(err, data){
      if(err) reply(err);
      if(data[0] != null){
        db.getWWRelatedProductList(data[0], function(err, RproductList){
          if(err == null) reply(RproductList);
          else reply(err);
        });
      }
    });  
  }
});

// Delete Expired Product
server.route({
  method: 'GET',
  path: '/wwproductexpired/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.WWProductExpired(product_id, function(err, result){
      if(err == null) reply({"msg":'Success'});
      else reply(err);
    });
  }
});

///////////////////////////////////////////////////////////
/* PANEL */
///////////////////////////////////////////////////////////

// Get Product Count
server.route({
  method: 'GET',
  path: '/productcount/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand_id = request.params.brand_id;
    db.getProductCount(brand_id, function(err, detail){
      if(err == null) reply(detail);
      else reply(err);
    });
  }
});

// Get Product List
server.route({
  method: 'GET',
  path: '/appproductlist/{brand_id}',
  config:{
    validate:{
      params:{
        brand_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var brand_id = request.params.brand_id;
    
    db.getAppProductList(brand_id, function(err, productList){
      if(err == null) reply(productList);
      else reply(err);
    });
  }
});

// Get Product Detail
server.route({
  method: 'GET',
  path: '/appproductdetail/{product_id}',
  config:{
    validate:{
      params:{
        product_id: Joi.string().regex(/^\d{1,11}$/)
      }
    }
  },
  handler: function (request, reply) {
    var product_id = request.params.product_id;
    db.getAppProductDetail(product_id, function(err, detail){
      if(err == null) reply(detail);
      else reply(err);
    });
  }
});

//------------------------ END --------------------------//
