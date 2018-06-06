/*************************************
* Name: Fiture App - mysql_app.js    *
* Version: 3.1.0                     *
* Node Module: hapi, mysql, md5, joi *
* Date: 14 March 2017                *
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
  user: 'appsfiture',
  password: 'AppsFiture@4',
  database: 'appsfiture'
});

exports.query = pool.query.bind(pool);

///////////////////////////////////////////////////////////                                              
/* ERROR LOG */                                                                                          
///////////////////////////////////////////////////////////                                              
                                                                                                         
exports.addErrorLog = function(data, callback){                                                          
  var stmt = "INSERT INTO error_log (user_id, msg) VALUES (?, ?);";                                      
  pool.query(stmt, [data.user_id, data.msg], function(err, result){                                      
    if(err) callback(err, null);                                                                         
    else callback(null, result);                                                                         
  });                                                                                                    
}     

///////////////////////////////////////////////////////////
/* ADMIN */
///////////////////////////////////////////////////////////

exports.adminlogin = function(data, callback) {
  var stmt = "SELECT admin_id, name, brand_id, 'product.html' AS nextdir FROM admin_account WHERE email = ? AND pw = ?;";
  pool.query(stmt, [data.email, data.pw], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* User app.fiture */
///////////////////////////////////////////////////////////

exports.userlogin = function(data, callback) {
  var stmt = "SELECT user_id FROM user_accont_app WHERE email = ? AND password = ?;";
  pool.query(stmt, [data.email, data.pw], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.userregister = function(data, callback) {
  var stmt = "INSERT INTO user_accont_app(name, email, password) VALUES (?, ?, ?)";
  pool.query(stmt, [data.name, data.email, data.pw], function(err, result){
    if(err) callback(err, null);
    else callback(null, result.insertId);
  });
}

exports.usercheck = function(email, callback) {
  var stmt = "SELECT user_id FROM user_accont_app WHERE email = ?;";
  pool.query(stmt, email, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* ACCOUNT */
///////////////////////////////////////////////////////////

// Guest Account
exports.addGuestAccount = function(data, callback) {
	// log(data);
  var stmt = "INSERT INTO guest_account (gender) VAlUES (?);";
  pool.query(stmt, [data.gender], function(err, result){
  	if(err) callback(err, null);
  	else callback(null, result.insertId);
  });
}

///////////////////////////////////////////////////////////
/* APN */
///////////////////////////////////////////////////////////

// Push Notification - Get Device User
exports.checkUserDevice = function(user_id, callback){
  var stmt = "SELECT device_id FROM user_devices WHERE user_id = ?;";
  pool.query(stmt, user_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Push Notification - Save Device
exports.addUserDevice = function(data, callback){
  var stmt = "INSERT INTO user_devices (user_id, token) VALUES (?, ?);";
  pool.query(stmt, [data.user_id, data.token], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Push Notification - Update Device
exports.updateUserDevice = function(data, callback){
  var stmt = "UPDATE user_devices SET token = ? WHERE user_id = ?;";
  pool.query(stmt, [data.token, data.user_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Push Notification - Get All Devices
exports.getDevice = function(callback){
  var stmt = "Select DISTINCT token FROM user_devices;";
  pool.query(stmt, callback);
}

///////////////////////////////////////////////////////////
/* BODY SIZE - app.fiture */
///////////////////////////////////////////////////////////

// Add User Body Size
exports.addUserBodySizeA = function(data, callback) {
  var stmt = "INSERT INTO user_body_size_app(user_id, gender, height, weight, top_length, bottom_length, neck, shoulder, chest, waist, low_waist, sleeve_length, hip, rise, thigh, calves, footwear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  pool.query(stmt, [data.user_id, data.gender, data.height, data.weight, data.top_length, data.bottom_length, data.neck, data.shoulder, data.chest, data.waist, data.low_waist, data.sleeve_length, data.hip, data.rise, data.thigh, data.calves, data.footwear], function(err, result){
    if(err) callback(err, null);
    else callback(null, result.insertId);
  });
}

// Get User Body Size
exports.getUserBodySizeA = function(user_id, callback) {
  var stmt = "SELECT gender, height, weight, top_length, bottom_length, neck, shoulder, chest, waist, low_waist, sleeve_length, hip, rise, thigh, calves, footwear, created_date FROM user_body_size_app WHERE created_date = (SELECT max(created_date) FROM user_body_size_app WHERE user_id = ?) AND user_id = ?;";
	pool.query(stmt, [user_id, user_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* BODY SIZE */
///////////////////////////////////////////////////////////

// Add User Body Size
exports.addUserSize = function(data, callback) {
  var stmt = "INSERT INTO user_body_size (user_id, gender, height, weight, shoulder, chest, waist, hip, thigh, calves, footwear) VAlUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  pool.query(stmt, [data.user_id, data.gender, data.height, data.weight, data.shoulder, data.chest, data.waist, data.hip, data.thigh, data.calves, data.footwear], function(err, result){
    if(err) callback(err, null);
    else callback(null, result.insertId);
  });
}

// Get User Body Size
exports.getUserSize = function(user_id, callback) {
  var stmt = "SELECT gender, height, weight, shoulder, chest, waist, hip, thigh, calves, footwear FROM user_body_size WHERE created_date = (SELECT max(created_date) FROM user_body_size WHERE user_id = ?) AND user_id = ?;";
	pool.query(stmt, [user_id, user_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Add User Body Size
exports.addUserBodySize = function(data, callback) {
  var stmt = "INSERT INTO user_body_size(user_id, gender, height, weight, top_length, bottom_length, neck, shoulder, chest, waist, low_waist, sleeve_length, hip, rise, thigh, calves, footwear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  pool.query(stmt, [data.user_id, data.gender, data.height, data.weight, data.top_length, data.bottom_length, data.neck, data.shoulder, data.chest, data.waist, data.low_waist, data.sleeve_length, data.hip, data.rise, data.thigh, data.calves, data.footwear], function(err, result){
    if(err) callback(err, null);
    else callback(null, result.insertId);
  });
}

// Get User Body Size
exports.getUserBodySize = function(user_id, callback) {
  var stmt = "SELECT gender, height, weight, top_length, bottom_length, neck, shoulder, chest, waist, low_waist, sleeve_length, hip, rise, thigh, calves, footwear, created_date FROM user_body_size WHERE WHERE created_date = (SELECT max(created_date) FROM user_body_size WHERE user_id = ?) AND user_id = ?;";
	pool.query(stmt, [user_id, user_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.addUserSuggestSize = function(user_id, product_id, size, callback) {
  var stmt = "INSERT INTO user_suggest_size(user_id, product_id, size) VALUES (?, ?, ?);";
	pool.query(stmt, [user_id, product_id, size], function(err, result){
    if(err) callback(err, null);
    else callback(null, result.insertId);
  });
}

exports.getUserSuggestSize = function(user_id, product_id, callback) {
  var stmt = "SELECT size FROM user_suggest_size WHERE user_id = ? AND product_id = ?;";
	pool.query(stmt, [user_id, product_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.getBrandSizeChart = function(chart_id, body_part, callback) {
  var stmt = "SELECT body_category_id, min, max, size FROM brand_size_chart WHERE chart_id = ? AND body_part = ?;";
	pool.query(stmt, [chart_id, body_part], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.getProductChart = function(product_id, callback) {
  var stmt = "SELECT brand_id, shop_id, body_part, category_id, chart_id FROM worldwide_product WHERE product_id = ?;";
	pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* Promo Code */
///////////////////////////////////////////////////////////

exports.getCode = function(code_id, callback) {
  var stmt = "SELECT code FROM promocode WHERE code_id = ?;";
  pool.query(stmt, code_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* CLICK RATE */
///////////////////////////////////////////////////////////

// Code Click Rate
exports.codeClick = function(code_id, callback) {
  var stmt = "UPDATE promocode SET views = views + 1 WHERE code_id = ?;";
  pool.query(stmt, code_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Worldwide Click Rate
exports.worldwideClick = function(gender, brand_id, callback) {
  var stmt = "UPDATE worldwide SET views = views + 1 WHERE prefix = ? AND brand_id = ?;";
  pool.query(stmt, [gender, brand_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Worldwide Product Click Rate
exports.WWProductClick = function(product_id, callback) {
  var stmt = "UPDATE worldwide_product SET views = views + 1 WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* EMAIL */
///////////////////////////////////////////////////////////

exports.getproductData = function(product_id, callback) {
  var stmt = "SELECT name, prefix, link, body_part, email FROM worldwide_product, brand WHERE worldwide_product.shop_id = brand.brand_id AND product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.getEmailCount = function(user_id, product_id, callback) {
  var stmt = "SELECT COUNT(enquiry_id) as num FROM email_enquiry WHERE user_id = ? UNION SELECT enquiry_id FROM email_enquiry WHERE product_id = ?;";
  pool.query(stmt, [user_id, product_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

exports.addEmailCount = function(user_id, product_id, callback) {
  var stmt = "INSERT INTO email_enquiry(user_id, product_id) VALUES (?, ?);";
  pool.query(stmt, [user_id, product_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* FAVOURITE */
///////////////////////////////////////////////////////////

// Add User Favourite Colour
exports.addFavColour = function(data, callback) {
  var stmt = "INSERT INTO user_fav_colour (user_id, white, black, red, orange, yellow, green, aqua_green, navy, violet, pink, brown, ash, grey, sky_blue) VAlUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  pool.query(stmt,[data.user_id, data.white, data.black, data.red, data.orange, data.yellow, data.green, data.aqua_green, data.navy, data.violet, data.pink, data.brown, data.ash, data.grey, data.sky_blue], function(err, res){
    if(err) callback(err, null);
    else callback(null, res.insertId);
  });
}

// Get User Favourite Colour
exports.getFavColour = function(user_id, callback) {
  var stmt = "SELECT white, black, red, orange, yellow, green, aqua_green, navy, violet, pink, brown, ash, grey, sky_blue FROM user_fav_colour WHERE created_date = (SELECT max(created_date) FROM user_fav_colour WHERE user_id = ?);";
	pool.query(stmt, user_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* Filter */
///////////////////////////////////////////////////////////

exports.filterList = function(callback) {
  var stmt = "SELECT product_filter.filter_id, filter_name, option_id, option_name  FROM product_filter LEFT JOIN product_filter_option ON product_filter.filter_id = product_filter_option.filter_id;";
  pool.query(stmt, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* SIZE SUGGUESTION */
///////////////////////////////////////////////////////////

// Get Designer Product Size
exports.getDProductSize = function(chart, callback) {
  var stmt = "SELECT size_chart.min, size_chart.max, size_chart.body_category_id, size_chart.size_id FROM size_chart WHERE size_chart.chart_id = ?;";
  pool.query(stmt, chart.chart_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Worldwide Product Size
exports.getWWProductSize = function(product_id, callback) {
  var stmt = "SELECT worldwide_product.prefix, worldwide_product.body_part, size_chart.chart, size_chart.it_chart FROM worldwide_product, size_chart WHERE worldwide_product.product_id = size_chart.product_id AND worldwide_product.product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product Size Sugguestion
exports.getSugSize = function(size_id, callback) {
  var stmt = "SELECT name FROM size WHERE size_id = ?;";
  pool.query(stmt, size_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get User Size ITALY
exports.getStandard = function(prefix, body_id, size, callback) {
  var stmt = "SELECT italy FROM standard_size WHERE prefix = ? AND body_id= ? AND min <= ? AND ? <= max;";
  pool.query(stmt, [prefix, body_id, size, size], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get User Standard Size
exports.getUserStandard = function(user_id, callback) {
  var stmt = "SELECT upper, waist, lower, foot FROM user_standard_size WHERE user_id = ?;";
  pool.query(stmt, user_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Add User Standard Size
exports.addUserStandard = function(user_id, upper, waist, lower, foot, callback) {
  var stmt = "INSERT INTO user_standard_size (user_id, upper, waist, lower, foot) VALUES (?, ?, ?, ?, ?);";
  pool.query(stmt, [user_id, upper, waist, lower, foot], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Update User Standard Size
exports.updateUserStandard = function(user_id, upper, waist, lower, foot, callback) {
  var stmt = "UPDATE user_standard_size SET upper = ?, waist = ?, lower = ?, foot = ? WHERE user_id = ?;";
  pool.query(stmt, [upper, waist, lower, foot, user_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* USER ACTIVITIES */
///////////////////////////////////////////////////////////

exports.addActivity = function(data, client_address, callback) {
  var stmt = "INSERT INTO user_activities (ip_address, action, uuid) VALUES (?, ?, ?);";
  pool.query(stmt, [client_address, data.action, data.uuid], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}


///////////////////////////////////////////////////////////
/* WORLDWIDE */
///////////////////////////////////////////////////////////

// Get Brand List
exports.getWWBrandList = function(gender, callback) {
  var stmt = "SELECT CONCAT(worldwide.prefix, worldwide.brand_id) AS brand_id, brand.brand_name, worldwide.imgurl, brand.description, brand.country, brand_category.name AS category_name FROM worldwide, brand, brand_category WHERE worldwide.brand_id = brand.brand_id AND brand.brand_category_id = brand_category.brand_category_id AND worldwide.status = 0 AND worldwide.prefix = ? ORDER BY worldwide.priority DESC;";
  pool.query(stmt, gender, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product Detail
exports.getWWProductDetail = function(product_id, callback) {
  var stmt = "SELECT worldwide_product.product_id, worldwide_product.name, worldwide_product.currency, worldwide_product.retail_price, worldwide_product.sales_price, worldwide_product.link, worldwide_product.imgurl, worldwide_product.description, worldwide_product.chart_id, brand.brand_name, brand.country, promocode.code FROM worldwide_product INNER JOIN brand ON worldwide_product.brand_id = brand.brand_id LEFT JOIN promocode ON worldwide_product.code_id = promocode.code_id WHERE worldwide_product.status = 0 AND worldwide_product.product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product List
exports.getWWProductList = function(gender, brand_id, callback) {
  var stmt = "SELECT worldwide_product.product_id, worldwide_product.name, worldwide_product.currency, worldwide_product.retail_price, worldwide_product.sales_price, worldwide_product.imgurl, worldwide_product.category_id, worldwide_product.color_id, worldwide_product.chart_id, promocode.code, (worldwide_product.retail_price - worldwide_product.sales_price) AS onSale FROM worldwide_product LEFT JOIN promocode ON worldwide_product.code_id = promocode.code_id WHERE status = 0 AND worldwide_product.prefix = ? AND (worldwide_product.brand_id = ? OR worldwide_product.shop_id = ?) ORDER BY worldwide_product.sales_price ASC, onSale DESC;";
  pool.query(stmt, [gender, brand_id, brand_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product List Testing
exports.getWWProductListt = function(gender, brand_id, it_chart, callback) {
  var stmt = "SELECT worldwide_product.product_id, worldwide_product.name, worldwide_product.currency, worldwide_product.retail_price, worldwide_product.sales_price, worldwide_product.imgurl, worldwide_product.category_id, worldwide_product.color_id, size_chart.available, promocode.code, (worldwide_product.retail_price - worldwide_product.sales_price) AS onSale FROM worldwide_product LEFT JOIN promocode ON worldwide_product.code_id = promocode.code_id LEFT JOIN size_chart ON worldwide_product.product_id = size_chart.product_id AND size_chart.it_chart = ? WHERE status = 0 AND worldwide_product.prefix = ? AND worldwide_product.brand_id = ? ORDER BY onSale DESC, worldwide_product.sales_price, worldwide_product.views DESC;";
  pool.query(stmt, [it_chart, gender, brand_id], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}


// Get Related Product Requried Data
exports.getWWRelatedProductData = function(product_id, callback) {
  var stmt = "SELECT brand_id, prefix FROM worldwide_product WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Related Product List
exports.getWWRelatedProductList = function(data, callback) {
  var stmt = "(SELECT related.product_id AS related_product_id, related.name, related.currency, related.retail_price, related.sales_price, related.imgurl FROM worldwide_product related WHERE related.product_id IN (SELECT product.product_id FROM worldwide_product product WHERE product.brand_id = ? AND product.prefix = ? AND product.body_part = 1) ORDER BY RAND() LIMIT 3) UNION ALL(SELECT related.product_id, related.name, related.currency, related.retail_price, related.sales_price, related.imgurl FROM worldwide_product related WHERE related.product_id IN (SELECT product.product_id FROM worldwide_product product WHERE product.brand_id = ? AND product.prefix = ? AND product.body_part = 2) ORDER BY RAND() LIMIT 3) UNION ALL(SELECT related.product_id, related.name, related.currency, related.retail_price, related.sales_price, related.imgurl FROM worldwide_product related WHERE related.product_id IN (SELECT product.product_id FROM worldwide_product product WHERE product.brand_id = ? AND product.prefix = ? AND product.body_part = 3) ORDER BY RAND() LIMIT 3);";
  pool.query(stmt, [data.brand_id, data.prefix, data.brand_id, data.prefix, data.brand_id, data.prefix], function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Delete Expired Product
exports.WWProductExpired = function(product_id, callback) {
  var stmt = "UPDATE worldwide_product SET status = 1 WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

///////////////////////////////////////////////////////////
/* PANEL */
///////////////////////////////////////////////////////////

// Get Product Count
exports.getProductCount = function(brand_id, callback) {
  var stmt = "SELECT COUNT(product_id) AS total FROM worldwide_product WHERE brand_id = ?;";
  pool.query(stmt, brand_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product List
exports.getAppProductList = function(brand_id, callback) {
  var stmt = "SELECT product_id, name, prefix, imgurl, link, currency, sales_price FROM worldwide_product WHERE brand_id = ?;";
  pool.query(stmt, brand_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

// Get Product Detail
exports.getAppProductDetail = function(product_id, callback) {
  var stmt = "SELECT product_id, prefix, name, currency, retail_price, sales_price, link, imgurl, description, body_part, category_id FROM worldwide_product WHERE product_id = ?;";
  pool.query(stmt, product_id, function(err, result){
    if(err) callback(err, null);
    else callback(null, result);
  });
}

//------------------------ END --------------------------//
