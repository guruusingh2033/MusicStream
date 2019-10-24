// var auth = require('../utils/auth');
const user = require('../models/user');
const authcheck = require('../middleware/authcheck');
const song = require('../models/song');
const validation = require('../middleware/allValidations/validations')

// Routes for authentication (signup, login, logout)
module.exports = function(app) {  
  // user Apis
  app.post('/signup', validation.signUp, user.signup);
  app.post('/filePost', user.uploadMulter.single('image'), user.imageUpload);
  app.post('/login', validation.login, user.login);
  app.post('/forgetPassword', validation.forgetPassword, user.forgetPassword);
  app.get('/user',  user.allUsers);
  app.post('/profile', validation.singleUser, user.singleUser);
  app.post('/createartist', validation.artist, user.artist);
  app.put('/editProfile', user.editProfile);
  // app.delete('/user/:id', authcheck, user.deleteUser);

  // song Apis
  app.post('/songsPost', song.songUploadMulter.single('song'), song.songUpload);
  app.post('/songsThumbImagePost', song.thumbUploadMulter.single('image'), song.thumbImageUpload);
  app.post('/songInsert', validation.song, song.songInsert);  
  app.get('/allSongsArtist', song.allSongsArtist); 
  app.post('/singleSongsArtist', validation.singleSongsArtist, song.singleSongsArtist); 
  app.get('/allArtist', song.allArtist); 
};















// SELECT
// tblUsers.tblUsers_Id,
//   tblUsers.Name,
//   tblUsers.UserImage,
//   NoOfSong.SongCount
// from tblUsers
// Left Join
//   (select ArtistId, count(*) as SongCount from tblMedia  group by ArtistId) as NoOfSong
// on tblUsers.tblUsers_Id = NoOfSong.ArtistId







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
