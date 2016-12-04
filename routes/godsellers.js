var express = require('express');
var router = express.Router();
var passport = require('passport');
var admin = require('../models/admin');
var customer = require('../models/customer');
var otp = require('../models/otp');
var Verify = require('./verify');
var jwt = require('jsonwebtoken');
var config = require('../config.js');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var client = require('twilio')('AC14e6e781ac71d95e371a849369ae48f1','632122e2975bce6a8a66ea48de33ee4c');


//*********************GENERAL*******************

//Pass "username" and "password" in the json data format
router.post('/login',function(req,res,next){
	passport.authenticate('local',function(err,user,info){
		if (err){
			return next(err);
		}
		if(!user){
			return res.status(401).json({err:info});
		}
		req.logIn(user,function(err){
			if (err){
				return res.status(500).json({
					err:'could not login user'
				});
			}			
			var token = Verify.getToken(user);
			res.status(200).json({
				status:'Login successful',
				success:true,
				token:token
			});
		});
	})(req,res,next);
});
	
router.get('/logout',function(req,res){
	req.logout();
	res.status(200).json({
		status:'Bye'
	});
});


//*********************ADMIN*********************

//Register as admin
//Pass "username","password","amount" and "role" in the json format
router.post('/admin/register',function(req,res){
	admin.register(new admin({username:req.body.username}),req.body.password,function(err,admin){
		if(err){
			if (err.status=500){
				return res.status(500).json({status:"This name is already taken"});
			
			//return res.status(500).json({err:err});
		}
		}
		if(req.body.amount){
			admin.amount = req.body.amount;
		}
		if(req.body.role){
			admin.role = req.body.role;
		}
		admin.save(function(err,user){
		passport.authenticate('local')(req,res,function(){
			return res.status(200).json({status:'Registration Successful'});
		});
		});
	});
});

//View all admins - Only an admin can do this
router.get('/admin/viewAdmins',Verify.verifyAdmin,function(req,res,next){
	admin.find({"role":"admin"},function(err,admin){
		if(err){
			if(err.status=401){
				return res.status(401).json({status:'You need to be an admin for this'});
			}
			else if(err.status=404){
				return res.status(404).json({status:'No admins'});
			}
			
			
		}
		res.json(admin);
	});
});

//View all vendors - Only an admin can do this
router.get('/admin/viewVendors',Verify.verifyAdmin,function(req,res,next){
	admin.find({"role":"vendor"},function(err,vendor){
		if(err){
			throw err;
		}
		res.json(vendor);
	});
});

//View all customers - Only as admin can do this
router.get('/admin/viewcustomer',Verify.verifyAdmin,function(req,res,next){
	customer.find({},function(err,customer){
		if(err){
			throw err;
		}
		res.json(customer);
	});
});

//Transfer money to a specific customer
//Pass "amount" and "recepient" in json format
router.post('/admin/moneytocust',Verify.verifyAdmin,function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token,config.secretKey,function(err,decoded){
			if(err){
				var err = new Error("You are not authenticated");
				err.status = 401;
				return next(err);
			}else{
				req.decoded = decoded;
				var amount = JSON.parse(req.body.amount);
				var recepient = req.body.recepient;
				var donor = decoded._doc.username;
				
				//Updating the database
				admin.update({"username":donor},{$inc:{"amount":-amount}},function(err,doc){
					if(err) throw err;
					res.json(doc);
				});
				customer.update({"mobileNumber":recepient},{$inc:{"amount":amount}},function(err,doc){
					if (err) throw err;
				});
			}
		});
	}
});

//*******************************VENDOR***************************

//Register a vendor
//Pass "username","password" , "amount" and "role" in json format
router.post('/admin/registerVendor',Verify.verifyAdmin,function(req,res,next){
	admin.register(new admin({username:req.body.username}),req.body.password,function(err,admin){
		if(err){
			return res.status(500).json({err:err});
		}
		if(req.body.amount){
			admin.amount = req.body.amount;
		}
		if(req.body.role){
			admin.role = req.body.role;
		}
		admin.save(function(err,user){
		passport.authenticate('local')(req,res,function(){
			return res.status(200).json({status:'Registration Successful'});
		});
		});
	});
});

//Vendor's account details
router.get('/vendor',function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token,config.secretKey,function(err,decoded){
			if(err){
				var err = new Error("You are not authenticated");
				err.status = 401;
				return next(err);
			}else{
				req.decoded = decoded;
				var vendor = decoded._doc.username;
				
				//Checking the database
				admin.find({"username":vendor},function(err,doc){
					if(err) throw err;
					res.json(doc);
				});
			}
		});
	}
});

//******************************CUSTOMER************************************

//Register a customer
//Pass "mobileNumber" in json format
router.post('/registerCustomer',function(req,res,next){
		var number = req.body.number;
		console.log('number: '+number);
		customer.create({'mobileNumber':number},function(err,doc){
			if (err){
				throw err;
			}else{
				console.log('inside else');
				res.json(doc);
			}
		});
});

//Transfer from customer to to vendor
//Pass "amount","recepient" and sender's own "mobileNumber" in json format
router.post('/cust2vend',function(req,res,next){
				var amount = JSON.parse(req.body.amount);
				var recepient = req.body.recepient;
				var donor = req.body.mobileNumber;
				
				//Updating the database
				admin.update({"username":recepient},{$inc:{"amount":amount}},function(err,doc){
					if(err) throw err;
					res.json(doc);
				});
				customer.update({"mobileNumber":donor},{$inc:{"amount":-amount}},function(err,doc){
					if (err) throw err;
				});
			
		
	
});

//Pass the mobileNumber entered as "number" in json format
router.post('/check',function(req,res,next){
	var number = req.body.number;
	console.log("number :"+number);
	var date = new Date();
	var d = date.getTime();
	var x = d.toString();
	var z = x.substring(x.length-6,x.length);
	console.log('z: '+z);
	console.log(x);
	client.sendMessage({
		to:number,
		from:'+61 429 529 370',
		body:'Your OTP is : '+z
	},function(err,data){
		if(err) console.log(err);
	});
	otp.find({"mobileNumber":number},function(err,doc){
		if(err){
			console.log("error caught");
			throw err;
		}
		else{
			console.log(doc[0]);
			//If this is a new number, add it to otp database with the otp generated
			if(doc.length==0){
				otp.create({"mobileNumber":number,"otp":z},function(err,doc){
					if(err) throw err;
				});
			}else{
				//If this is a repeating number, update the value of the otp
				otp.update({"mobileNumber":number},{$set:{"otp":z}},function(err,doc){
					if(err) throw err;
				});
			}
			
			
			
			return res.status(200).json({status:'Successful'});
		}
	});
});

//
router.post('/verify',function(req,res,next){
	var number = req.body.number;
	var otps = req.body.otp;
	console.log(otps+' :opt from request');
	
	otp.find({"mobileNumber":number},function(err,doc){
		if(err) throw err;
		console.log("doc: "+doc);
		var potp = doc[0].otp;
		console.log(potp+" :otp stored");
		
		//Compare the values of the otp entered and the one stored in database corresponding to the number
		if(potp==otps){
			customer.create({"mobileNumber":number},function(err,doc){
				if (err){
					throw err;
				}
				else{
					res.json(doc);
				}
			});
		}else{
			res.status("wrong otp");
		}
	});
});



module.exports = router;