var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var User = mongoose.model('User');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
     // by default, local strategy uses username and password, we will override with email
     usernameField : 'username',
     passwordField : 'password',
     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
 },
 function(req, username, password, done) {

     // asynchronous
     process.nextTick(function() {
         User.findOne({ 'username' :  username }, function(err, user) {
             // if there are any errors, return the error
             if (err)
                 return done(err);

             // if no user is found, return the message
             if (!user){
               console.log('No user found');
                 return done(null, false, { message: 'No user found.' });
               }

             if (!user.validPassword(password))
             {
               console.log('Wrong password');
                 return done(null, false, {message: 'Wrong password.'});
               }

             // all is well, return user
             else
                 return done(null, user);
         });
     });

 }));


 passport.use('local-signup', new LocalStrategy({
     // by default, local strategy uses username and password, we will override with email
     usernameField : 'username',
     passwordField : 'password',
     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
 },
 function(req, username, password, done) {
    console.log('inside local-signup');
     // asynchronous
     process.nextTick(function() {

         //  Whether we're signing up or connecting an account, we'll need
         //  to know if the email address is in use.
         User.findOne({'username': username}, function(err, existingUser) {

             // if there are any errors, return the error
             if (err)
                 return done(err);

             // check to see if there's already a user with that email
             if (existingUser)
                 return done(null, false, {message: 'That username is already taken.'});

             //  If we're logged in, we're connecting a new local account.
             if(req.user) {
               console.log('Already logged in.')

                 var user  = req.user;
                 user.username   = username;
                 user.password = user.generateHash(password);
                 user.save(function(err) {
                     if (err)
                         throw err;
                     return done(null, user);
                 });
             }
             //  We're not logged in, so we're creating a brand new user.
             else {
                 // create the user

                 var newUser            = new User();

                 newUser.username    = username;
                 newUser.password = newUser.generateHash(password);


                 newUser.save(function(err) {
                     if (err)
                         throw err;

                     return done(null, newUser);
                 });
             }

         });
     });

 }));

 module.exports = passport;
