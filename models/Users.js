var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

mongoose.set('debug', true);


var UserSchema = new mongoose.Schema({
        username: {
            type: String,
            unique: true
        },
        password: String,
        results: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    }]


});

UserSchema.plugin(deepPopulate);
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


UserSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
        results: this.results,
    }, 'SECRET');
};




mongoose.model('User', UserSchema);
