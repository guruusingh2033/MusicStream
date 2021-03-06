// var auth = require('../utils/auth');
const user = require('../controller/user');
const song = require('../controller/song');
const approval = require('../controller/approval');
const wishList = require('../controller/wishlist');
const validation = require('../middleware/allValidations/validations');
const like = require('../controller/like');
const comment = require('../controller/comment');
const booking = require('../controller/booking');
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
  app.post('/editProfilebyAdmin', validation.editProfilebyAdmin, user.editProfilebyAdmin);
  app.post('/artistLikingAdminIncrement', validation.artistLikingAdminIncrement, user.artistLikingAdminIncrement);
  app.post('/loginWithOtpInsert', validation.loginWithOtpInsert, user.loginWithOtpInsert);   
  app.post('/loginWithSocialMediaAccount', validation.email, user.loginWithSocialMediaAccount); 
 
  // user Apis
  app.get('/user', user.allUsers);
  app.post('/profile', validation.singleUser, user.singleUser);
  app.post('/editProfile', validation.editProfile, user.editProfile);
  app.post('/delProfile', validation.deleteProfile, user.deleteProfile);
  app.post('/delProfileArtist', validation.deleteProfile, user.delProfileArtist);
  app.get('/allUserType2', user.allUserType2);  // get all user having type 2 (mean not artist/admin only user)
  app.post('/insertCheckValue', validation.insertCheckValue, user.insertCheckValue);
  app.post('/insertArtistLike', validation.insertArtistLike, user.insertArtistLike);
  app.post('/fetchLikesOfParticularUser', validation.userIdArtitstId, user.fetchLikesOfParticularUser);
  app.post('/fetchTotalLikesOfArtist', validation.artistId, user.fetchTotalLikesOfArtist);
  app.get('/countOfUserArtist', user.countOfUserArtist); // get count of artist(type 3), user(type 2),  pending(status 2) Artist, Approved(status 1) Artist

  // Song Apis 
  app.post('/songsPost', song.songUploadMulter.single('song'), song.songUpload);
  app.post('/songsThumbImagePost', song.thumbUploadMulter.single('image'), song.thumbImageUpload);
  app.post('/songInsert', validation.song, song.songInsert);  
  app.post('/delMediaArtIdMedId', validation.deleteMediaArtIdMedId, song.deleteMediaArtIdMedId);
  app.get('/allSongsArtist', song.allSongsArtist);  // return all artists and songs
  app.get('/allVideosArtist', song.allVideosArtist);  // return all artists and Videos
  app.post('/singleSongsArtist', validation.artistId, song.artistAllAudioSong); // get All mp3 song with artist ID
  app.post('/allVideosWithArtistId', validation.artistId, song.allVideosWithArtistId); // get All videos with artist ID
  app.get('/allArtist', song.allArtist); // return all artist with there No of Song and also no of videos
  app.post('/countMediaArtId', validation.artistId, song.countMediaArtId); // return counting of videos and song based on artist Id
  app.get('/noOfAudioNoOfVideo', song.noOfAudioNoOfVideo);
  // used for Searching at frontend
  app.get('/dataOfUserAndMediaForSearching', song.dataOfUserAndMediaForSearching)  // get all data of tbluser and tblmedia where status = 1 
  
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

  // Liking api
  app.post('/likeDislike', validation.userIdMediaId, like.addLikeDislike); 
  app.post('/fetchLikeDislike', validation.userIdMediaId, like.fetchLikeDislike); 
  app.post('/artistListLikesByUser', validation.userId, like.artistListLikeByUser); // list of artist who has liked by the user 

  // comment api
  app.post('/addComment', validation.userIdMediaId, comment.addComment); 
  app.post('/fetchComment', validation.mediaId, comment.fetchComment);
  app.post('/countLikeCommentByMedidId', validation.mediaId, comment.countLikeCommentByMedidId);

  // Booking api
  app.post('/insertBooking', validation.booking, booking.insertBooking);
  app.post('/fetchBooking', validation.artistId, booking.fetchBooking);
  app.post('/fetchAllBooking', booking.fetchAllBooking); // get detail of booking and artist
  app.post('/deleteBooking', booking.deleteBooking);
  app.post('/editBooking', validation.bookingId, validation.booking, booking.editBooking); 
  app.post('/bookNowEvent',booking.bookNowEvent);   
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

  // swagger
  // http://demo.trms.com/CarouselAPI/swagger/ui/index#/Authentications
