// var auth = require('../utils/auth');
const user = require('../models/user');
const authcheck = require('../middleware/authcheck');
const song = require('../models/song');
const approval = require('../models/approval');
const validation = require('../middleware/allValidations/validations');

// Routes for authentication (signup, login, logout)
module.exports = function(app) {  

  // Auth Apis
  app.post('/signup', validation.signUp, user.signup);
  app.post('/filePost', user.uploadMulter.single('image'), user.imageUpload);
  app.post('/login', validation.login, user.login);
  app.post('/forgetPassword', validation.forgetPassword, user.forgetPassword);
  app.post('/createartist', validation.artist, user.artist); 

  // user Apis
  app.get('/user', user.allUsers);
  app.post('/profile', validation.singleUser, user.singleUser);
  app.post('/editProfile', validation.editProfile, user.editProfile);
  app.post('/delProfile', validation.deleteProfile, user.deleteProfile);
  app.post('/delMediaArtIdMedId', validation.deleteMediaArtIdMedId, user.deleteMediaArtIdMedId);
  app.get('/allUserType2', user.allUserType2);

  // Song Apis 
  app.post('/songsPost', song.songUploadMulter.single('song'), song.songUpload);
  app.post('/songsThumbImagePost', song.thumbUploadMulter.single('image'), song.thumbImageUpload);
  app.post('/songInsert', validation.song, song.songInsert);  
  app.get('/allSongsArtist', song.allSongsArtist);  // return all artists and songs
  app.post('/singleSongsArtist', validation.artistId, song.singleSongsArtist); // get All song with artist ID
  app.get('/allArtist', song.allArtist); // return all artist with there No of Song

  // Approval api
  app.get('/allApprovedArtist', approval.allApprovedArtist); // return all aproved artist (usertype 3)
  app.get('/allPendingArtist', approval.allPendingArtist); // return all pending artist (usertype 3)
  app.post('/approveToArtist', validation.artistId, approval.approveToArtist); 
  
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
