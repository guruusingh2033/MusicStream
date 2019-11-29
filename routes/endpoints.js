// var auth = require('../utils/auth');
const user = require('../controller/user');
const song = require('../controller/song');
const approval = require('../controller/approval');
const wishList = require('../controller/wishlist');
const validation = require('../middleware/allValidations/validations');
const like = require('../controller/like');
// const authcheck = require('../middleware/authcheck');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Routes for authentication (signup, login, logout)
module.exports = function(app) {  

  // swagger
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
  app.get('/allUserType2', user.allUserType2);  // get all user having type 2 (mean not artist/admin only user)

  // Song Apis 
  app.post('/songsPost', song.songUploadMulter.single('song'), song.songUpload);
  app.post('/songsThumbImagePost', song.thumbUploadMulter.single('image'), song.thumbImageUpload);
  app.post('/songInsert', validation.song, song.songInsert);  
  app.post('/delMediaArtIdMedId', validation.deleteMediaArtIdMedId, song.deleteMediaArtIdMedId);
  app.get('/allSongsArtist', song.allSongsArtist);  // return all artists and songs
  app.get('/allVideosArtist', song.allVideosArtist);  // return all artists and Videos
  app.post('/singleSongsArtist', validation.artistId, song.artistAllAudioSong); // get All mp3 song with artist ID
  app.post('/allVideosWithArtistId', validation.artistId, song.allVideosWithArtistId); // get All videos with artist ID
  app.get('/allArtist', song.allArtist); // return all artist with there No of Song
  app.post('/countMediaArtId', validation.artistId, song.countMediaArtId); // return counting of videos and song based on artist Id
  
  // Approval api
  app.get('/allApprovedArtist', approval.allApprovedArtist); // return all aproved artist (usertype 3)
  app.get('/allPendingArtist', approval.allPendingArtist); // return all pending artist (usertype 3)
  app.post('/approveToArtist', validation.artistId, approval.approveToArtist); // approve to artist updating his username password 
  app.post('/changeStatus', validation.IdStatus, approval.changeStatus); // change status of any user active or in-active

  // Whishlist api
  app.post('/InsertwishList', validation.userIdMediaId, wishList.insert); 
  app.post('/GetWishListByUserId', validation.userId, wishList.getWishListMediaByUserId);  // return all record of wishlist, media with artist name(tbluser) based on userId 
  app.post('/delWishListByUserIdMediaId', validation.userIdMediaId, wishList.deleteWishListByUserIdMediaId);   // remove record from wishlist
  app.post('/checkwishlist', validation.userIdMediaId, wishList.checkwishlist );  // check whether record present in wishlist or not based on user id and media id

  // Liking
  app.post('/likeDislike', validation.userIdMediaId, like.addLikeDislike); 
  app.post('/fetchLikeDislike', validation.userIdMediaId, like.fetchLikeDislike); 

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
