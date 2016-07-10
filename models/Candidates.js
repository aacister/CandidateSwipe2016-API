var mongoose = require('mongoose');

mongoose.set('debug', true);

var CandidateSchema = new mongoose.Schema({
    name: String,
    party: String,
    category: String,
    locality: String,
    image: String

});


mongoose.model('Candidate', CandidateSchema);
