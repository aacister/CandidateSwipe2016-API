var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Candidate = mongoose.model('Candidate');

router.param('candidate', function(req, res, next, id) {
  var query = Candidate.findById(id);

  query.exec(function (err, candidate){
    if (err) { return next(err); }
    if (!candidate) { return next(new Error('can\'t find candidate')); }

    req.candidate = candidate;
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

// GET candidate by id
router.get('/candidates/:candidate', function(req, res) {
  res.json(req.candidate);
});


// GET candidated by locality
router.get('/candidates/locality/:locality', function(req, res) {
    res.json(req.candidates);


});


router.put('/candidates/:candidate/vote', function(req, res, next) {
  req.candidate.vote(function(err, candidate){
    if (err) { return next(err); }

    res.json(candidate);
  });
});

router.put('/candidates/:candidate/removeVote', function(req, res, next) {
  req.candidate.removeVote(function(err, candidate){
    if (err) { return next(err); }

    res.json(candidate);
  });
});



module.exports = router;
