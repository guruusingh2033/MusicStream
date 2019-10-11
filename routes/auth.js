var auth = require('../utils/auth');
var user = require('../models/user');
const authcheck = require('../middleware/authcheck');

// Routes for authentication (signup, login, logout)
module.exports = function(app) {

  // app.get('/signup', auth.alreadyLoggedIn, function(req, res, next) {

  //   res.render('signup', { message: req.flash('signupMessage') });

  // });

  // app.post('/signup', passport.authenticate('local-signup', {
  //   successRedirect: '/profile',
  //   failureRedirect: '/signup',
  //   failureFlash: true // Allow flash messages
  // }));

  app.post('/signup', user.signup);

  // app.get('/login', auth.alreadyLoggedIn, function(req, res, next) {

  //   res.render('login', { message: req.flash('loginMessage') });

  // });  

  // app.post('/login', passport.authenticate('local-login', {
  //   successRedirect: '/profile',
  //   failureRedirect: '/login',
  //   failureFlash: true // Allow flash messages
  // }));
  app.post('/login', user.login);

  app.get('/getUser', authcheck, user.listUsers);

  // app.get('/logout', function(req, res, next) {

  //   req.logout();
  //   res.redirect('/');

  // });

};
