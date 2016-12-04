var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var otp = new Schema({
	mobileNumber:Number,
	otp:String
});


module.exports = mongoose.model("Otp",otp);