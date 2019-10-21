// var auth = require('../utils/auth');
var user = require('../models/user');
const authcheck = require('../middleware/authcheck');

// Routes for authentication (signup, login, logout)
module.exports = function(app) {  
  app.post('/signup', user.signUpvalidation, user.signup);
  app.post('/login', user.login);
  app.post('/forgetPassword', user.forgetPassword);
  app.get('/user',  user.allUsers);
  app.post('/profile', user.singleUser);
  app.delete('/user/:id', authcheck, user.deleteUser);
  app.post('/createartist', user.artistValidation, user.artist);
  // app.put('/User/', authcheck, user.updateUser);
  // user.imageValidation,
  app.post('/filePost',  user.uploadMulter.single('image'), user.imageUpload);
};


































// previes code
  // app.get('/signup', auth.alreadyLoggedIn, function(req, res, next) {
  //   res.render('signup', { message: req.flash('signupMessage') });
  // });

  // app.post('/signup', passport.authenticate('local-signup', {
  //   successRedirect: '/profile',
  //   failureRedirect: '/signup',
  //   failureFlash: true // Allow flash messages
  // }));

  // app.get('/login', auth.alreadyLoggedIn, function(req, res, next) {
  //   res.render('login', { message: req.flash('loginMessage') });
  // });  

  // app.post('/login', passport.authenticate('local-login', {
  //   successRedirect: '/profile',
  //   failureRedirect: '/login',
  //   failureFlash: true // Allow flash messages
  // }));

  // app.get('/logout', function(req, res, next) {
  //   req.logout();
  //   res.redirect('/');
  // });
