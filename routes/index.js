var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
//var passport = require('passport');
var passport = require('../config/passport');
var jwt = require('express-jwt');
var cors = require('cors');

var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});


var Candidate = mongoose.model('Candidate');
var User = mongoose.model('User');



router.param('candidate', function(req, res, next, id) {
  var query = Candidate.findById(id);

  query.exec(function (err, candidate){
    if (err) { return next(err); }
    if (!candidate) { return next(new Error('can\'t find candidate')); }

    req.candidate = candidate;
    return next();
  });
});

router.param('user', function(req, res, next, id) {
    var query = User.findById(id);

    query.exec(function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error("Can't find user."));
        }

        req.user = user;
        return next();
    });
});

router.param('locality', function(req, res, next, locality){
  var query = Candidate.find({'locality': locality});
  query.exec(function (err, candidates){
    if (err) { return next(err); }
    if(!candidates) {return next(new Error('can\'t find candidates.'));}
    req.candidates = candidates;
    return next();
  });
});

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET all candidates
router.get('/candidates', function(req, res, next) {
  Candidate.find(function(err, candidates){
    if(err){ return next(err); }

    res.json(candidates);
  });
});

//Get a user
router.get('/users/:user', function(req, res, next) {
    res.json(req.user);
});

// GET candidate by id
router.get('/candidates/:candidate', function(req, res) {
  res.json(req.candidate);
});


// GET candidated by locality
router.get('/candidates/locality/:locality', function(req, res) {
    res.json(req.candidates);


});
//GET user's results
router.get('/users/:user/results', function(req, res){

  req.user.deepPopulate(['results'], function(err, user) {
   res.json(user);
  });

});

// Add a result
router.put('/user/:user/results/:candidate/vote', function(req, res, next) {
        var candidate = req.candidate;
            //save result to User
            req.user.results.push(candidate);

            req.user.save(function(err, savedUser) {
                if (err)
                {
                    return next(err);
                }
                else {

                  savedUser.deepPopulate(['results'], function(err, user) {
                    res.json(user);
                  });

                }
              });
});

//Delete a result
router.delete('/user/:user/results/:candidate', auth, function(req, res, next) {
      var candidate = req.candidate;

            //Remove user flight and Save user
            var i = req.user.results.indexOf(candidate._id);
            if(i != -1) {
            	req.user.results.splice(i, 1);
            }
            req.user.save(function(err, savedUser) {
                if (err) {

                    return next(err);
                }
                res.json(savedUser);
            });




});

// Register user via Passport's Local Strategy
router.post('/register', function(req, res, next) {

    passport.authenticate('local-signup', function(err, user, info) {
        if (err) {

            return next(err);
        }
        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

// Login user via Passport's Local Strategy
router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({
                token: user.generateJWT()
            });
        } else {
          //  return res.status(401).json(info);
          return res.status(401);
        }
    })(req, res, next);
});

module.exports = router;
