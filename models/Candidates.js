var mongoose = require('mongoose');

mongoose.set('debug', true);

var CandidateSchema = new mongoose.Schema({
    name: String,
    party: String,
    category: String,
    locality: String,
    image: String,
    votes: {
        type: Number,
        default: 0
    }

});

CandidateSchema.methods.vote = function(cb) {
  this.votes += 1;
  this.save(cb);
};

CandidateSchema.methods.removeVote = function(cb) {
  this.votes -= 1;
  this.save(cb);
};

mongoose.model('Candidate', CandidateSchema);
