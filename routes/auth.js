// var auth = require('../utils/auth');
var user = require('../models/user');
const authcheck = require('../middleware/authcheck');
const { check, oneOf, validationResult } = require('express-validator');



// Routes for authentication (signup, login, logout)
module.exports = function(app) {  

  // app.post('/signup', user.signup );

  app.post('/signup',
    oneOf([      
      [
        check('email', 'Enter email').not().isEmpty(),
        check('email', 'Your email is not valid').isEmail(),
        check('password', 'Enter password').not().isEmpty(),
        //check('image').not().isEmpty(),
      ]

     // [check('image').not().isEmpty()], check('type').equals(3), 
  ]),
    function (req, res, next) {
      const errors = validationResult(req);
      console.log(req.body);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      } else {
        next();
      }
    }, user.signup);


  app.post('/login', user.login);
  app.post('/forgetPassword', user.forgetPassword);
  app.get('/user',  user.allUsers);
  app.get('/profile', user.singleUser);
  app.delete('/user/:id', authcheck, user.deleteUser);
  // app.put('/User/', authcheck, user.updateUser);

  app.post('/filePost', user.uploadMulter.single('image'), user.imageUpload);


  // check('name').not().isEmpty().withMessage('Name must have more than 5 characters'),
  //   check('classYear', 'Class Year should be a number').not().isEmpty(),
  //   check('weekday', 'Choose a weekday').optional(),
  //   check('email', 'Your email is not valid').not().isEmpty(),
  //   check('password', 'Your password must be at least 5 characters').not().isEmpty(),






















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

};
