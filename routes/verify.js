//var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config.js');

exports.getToken = function(user){
	return jwt.sign(user,config.secretKey,{
		expiresIn:100 
	});
};

exports.verifyOrdinaryUser = function(req,res,next){
	var token = req.body.token||req.query.token||req.headers['x-access-token'];
	
	if(token){
		jwt.verify(token,config.secretKey,function(err,decoded){
			if(err){
				var err = new Error('You are not authenticated');
				err.status = 401;
				return next(err);
			}else{
				req.decoded = decoded;
				//console.log('req.decoded: ',req.decoded);
				//console.log('decoded: ',decoded);
				if (req.decoded._doc.admin==false){
					next();
				}
				else{
					var err = new Error('not authenticated');
					err.status = 401;
					return next(err);
				}
				
			}
		});
	}else{
		var err = new Error('No token');
		err.status = 403;
		return next(err);
	}
};

exports.verifyAdminUser = function(req,res,next){
	var token = req.body.token||req.query.token||req.headers['x-access-token'];
	
	if(token){
		jwt.verify(token,config.secretKey,function(err,decoded){
			if(err){
				var err = new Error('You are not authenticated');
				err.status = 401;
				return next(err);
			}else{
				req.decoded = decoded;
				console.log(req.decoded._doc.admin,'admin flag check');
				//console.log('req.decoded: ',req.decoded);
				//console.log('decoded: ',decoded);
				console.log('username: ',req.decoded.username);
				console.log('req.decoded: ',req.decoded);
				if(req.decoded._doc.admin==true){
					next();
				}else{
					var err = new Error('no admin');
					err.status = 401;
					return next(err);
				}
			}
		});
	}else{
		var err = new Error('No token');
		err.status = 403;
		return next(err);
	}
};

exports.verifyAdmin = function(req,res,next){
	var token = req.body.token||req.query.token||req.headers['x-access-token'];
	if(token){
		jwt.verify(token,config.secretKey,function(err,decoded){
			if (err){
				var err = new Error('Please login again');
				err.status = 401;
				return next(err);
			}else{
				req.decoded = decoded;
				console.log('req.decoded: ',req.decoded);
				if (req.decoded._doc.role=="admin"){
					next();
				}else{
					console.log('inside else');
					var err = new Error('Sorry only an admin can do this');
					err.status = 401;
					return next(err);
				}
			}
		});
	}else{
		var err = new Error("Database error");
		err.status = 403;
		return next(err);
	}
};

/*exports.verifyCustomer = function(req,res,next){
	//var token = req.body.token||req.query.token||req.headers['x-access-token'];
	//if(token){
		//jwt.verify(token,config.secretKey,function(err,decoded){
			//if (err){
				//var err = new Error('You are not authenticated');
				//err.status = 401;
				//return next(err);
			//}else{
				//req.decoded = decoded;
				//console.log('req.decoded: ',req.decoded);
				if (req.decoded._doc.role=="customer"){
					next();
				}else{
					console.log('inside else');
					var err = new Error('Not a customer');
					err.status = 401;
					return next(err);
				}
			}
		});
	}else{
		var err = new Error("No token");
		err.status = 403;
		return next(err);
	}
};*/