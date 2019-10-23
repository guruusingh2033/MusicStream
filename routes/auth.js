// var auth = require('../utils/auth');
const user = require('../models/user');
const authcheck = require('../middleware/authcheck');
const song = require('../models/song');
const validation = require('../middleware/allValidations/validations')

// Routes for authentication (signup, login, logout)
module.exports = function(app) {  
  // user Apis
  app.post('/signup', user.signup);
  app.post('/filePost', user.uploadMulter.single('image'), user.imageUpload);
  app.post('/login',  user.login);
  app.post('/forgetPassword',  user.forgetPassword);
  app.get('/user',  user.allUsers);
  app.post('/profile',  user.singleUser);
  app.post('/createartist',  user.artist);
  // app.put('/User/', authcheck, user.updateUser);
  // app.delete('/user/:id', authcheck, user.deleteUser);

  // song Apis
  app.post('/songsPost', song.songUploadMulter.single('song'), song.songUpload);
  app.post('/songsThumbImagePost', song.thumbUploadMulter.single('image'), song.thumbImageUpload);
  app.post('/songInsert',  song.songInsert);  
  app.get('/allSongsArtist', song.allSongsArtist); 
  app.post('/singleSongsArtist',  song.singleSongsArtist); 
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
