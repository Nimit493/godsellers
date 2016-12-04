var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var customer = new Schema({
	mobileNumber:{
		type:Number,
		unique:true
		},
	role:{
		type:String,
		default:"customer"
	},
	amount:{
		type:Number,
		default:0
	}
});


module.exports = mongoose.model("Customer",customer);