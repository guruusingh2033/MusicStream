var uuidV4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
var db     = require('./db');
const multer = require('multer');
var md5 = require('md5');
require('dotenv/config');


var signup = function (req, res) {
  // Check if there's already a user with that email
  db.query('SELECT * FROM tblUsers WHERE email = ?', [req.body.email], function (err, rows) {
    // if (err)
    //   return res.status(500).json([ { success: 0 } ])
      // return res.status(500).send([0, err]);
    if (rows.length) {
      return res.status(200).json([ { success: 'An account with this email address already exists.' } ])
      // return res.status(400).send([0,'An account with that email address already exists.']);
    } else {

      // copy image in parmanent folder (registrationImages)
      fileCopy(req);

      // function for creating user in DB
      createUser(req, res);       
    }
  });
};

// require('../MusicStream/images/registrationImages/tempFile/')
const imagePath = '../test/images/registrationImages/';
// fucntion used in signup function
// copy file temporary folder to original folder
function fileCopy(req) { //
  if (req.body.image && filePath == req.body.image  ) {
    const fs = require('fs');
    let source = imagePath + req.body.image;
    let destination = imagePath + req.body.image.replace('tempFile/', '');
    // Copy dsingle file of folder
    fs.copyFile(source, destination, (err) => {
      if (err) throw err;
      console.log('Success Copy file');
      deleteFile();
    });
  }
  else { console.log('image path not match with uploaded path'); }
}

// fucntion used in fileCopy function
// delete file from temperaory folder 
function deleteFile() {
  const fs = require('fs');
  const path = require('path');
  const directory = imagePath + 'tempFile';
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
        msg = 'successfully deleted ' + file;
        console.log('successfully deleted ' + file);
      });
    }
  });
}


// creating user in DB
var createUser = (req, res) => {

  // if (req.body.type == 3) {
  //   req.check('image', 'image is required').notEmpty();   
  // } else {
  //   validation(req);
  // }

  // let errors = req.validationErrors();

  // if (errors) {
  //   res.status(400).json({message:'Validation Error'});
  // }


  // Set values of user
  var newUser = {
    id: generateUserId(),
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
    phone_no: req.body.phone_no,
    image: req.body.image,
    type: req.body.type,
    status: req.body.status
  };

  if (req.body.image) newUser.image = req.body.image.replace('tempFile/', '');

  

  // Inserting user details in DB
  db.query('INSERT INTO tblUsers ( tblUsers_ID, name, password, email, Userimage, Usertype, status, MobileNo ) values (?,?,?,?,?,?,?,?)',
    [newUser.id, newUser.name, newUser.password, newUser.email, newUser.image, newUser.type, newUser.status, newUser.phone_no],
    function (err) {

      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // If we somehow generated a duplicate user id, try again
          return res.status(200).json([ { success: 'duplicate entry' } ] )
          // return res.status(400).json({ message: 'Signup Failed', error: 'duplicate entry ' + err});
        }
        return res.status(500).json([ { success: 0 } ])
        // return res.status(500).json({ message: 'Signup Failed', error: 'error while inserting data into DB ' + err });
      }

      // Return Crearte user Sucessfull message and user name 
      db.query('SELECT * FROM tblUsers WHERE email = ?', [newUser.email], function (err, rows) {
        if (err) return res.send([0, err]);         
        return res.status(201).json([ rows[0] ]);
      });

    }
  );

};

// var validation = function(req){
//   req.check('email', 'Email is required').notEmpty();
//   req.check('email', 'Email is not valid').isEmail();
//   req.check('password', 'Password is required').notEmpty();
// }

// used in signup function 
// Gets a random id for this user
var generateUserId = function () {
  return uuidV4();
};

// used in signup function 
// Hash and salt the password with bcrypt
// var hashPassword = function (password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };
// Note : used MD5 instead bcrypt algo



var login = function (req, res) {
  // Check that the user logging in exists
  db.query('SELECT * FROM  tblUsers WHERE email = ?', [req.body.email], function (err, rows) {

    if (err)
      return res.status(500).json([ { success: 0 } ])
      // return res.status(500).send({ message: 'Invalid Username Password', error: 'Error while checking email from DB '+ err });

    // if user not found return Invalid Username
    if (rows.length == 0)
      return res.status(401).json([ { success: 0 } ]);
      // return res.status(401).send({ message: 'Invalid Username Password'});

    // if valid password User successfully logged in, return username with token
    if (md5(req.body.password) === rows[0].Password) {

      // validPassword(req.body.password, rows[0].Password)
      // function for generating token with JWT
      // const tokenStore = generateToken(rows);

      //return res.status(200).send([1, rows[0].Email, tokenStore]);
      return res.status(200).json([ rows[0] ]);
      // return res.status(200).send({ message: 'Login Success', data: rows[0]});
    }
    return res.status(401).json([ { success: 0 } ]);
    // return res.status(401).send({ message: 'Invalid Username Password', error: 'Error while checking email from DB ' + err });

  });
};
// used in login function 
// Check if password is correct
// var validPassword = function (password, savedPassword) {
//   return bcrypt.compareSync(password, savedPassword);
// };
// Note :  used MD5 instead bcrypt algo

// used in login function 
// generating token
// const generateToken = (rows) =>{
//   const id = rows[0].ID;
//   const password = rows[0].Password;
//   // generating token
//   return tokenStore = jwt.sign(
//                                 { id: id, password: password },
//                                 process.env.JWT_SECRET_KEY,    //secret key
//                                 { expiresIn: '1h' }
//                               );
// };
// Note : no need yet of token

// check email from db, if email exists return user detail
var forgetPassword = (req,res)=> {
  db.query('SELECT * FROM tblUsers WHERE email = ?', [req.body.email], function (err, rows) {

    if (err)
      return res.status(500).json([ { success: 0 } ])
      // return res.status(500).send([0, err]);

    // if user not found return Invalid Username
    if (rows.length == 0)
      return res.status(401).json([ { success: 0 } ])
      // return res.status(401).send([0, 'Email not registered.']);

    // if Email valid return password
    if (req.body.email === rows[0].Email) {      
      return res.status(401).json([ rows[0] ])
      // return res.status(200).send([1, rows[0].Password]);
    }
    return res.status(401).json([ { success: 0 } ]);
    // return res.status(401).send([0, 'Email not registered.']);

  });
}




// List all users
// callback(err, users)
var allUsers = (req, res) => {
  db.query('SELECT * FROM tblUsers', [], function (err, rows) {    
    if (err)  return res.status(400).json([ err ]);

    return res.status(200).json(rows);
  });
};

// get single users
// callback(err, users)
var singleUser = (req, res) => {
  const id = req.body.id; // get id from body
  if (!id) return res.status(200).json([{ success: 'Invalid Id' }])

  db.query('SELECT * FROM tblUsers WHERE tblUsers_ID = ?', [id], function (err, rows) {
    if (err) return res.status(400).json([ { success: 0 } ]) // return res.status(400).json(err);

    if (rows.length === 0) return res.status(200).json([{ success: 'Id does not exists' }])

    return res.status(200).json(rows)
    // return res.status(200).json(rows);
  });
};
// Delete a user
// callback(err)
var deleteUser = function (req, callback) {
  const id = req.params.id; // get id from url
  db.query('DELETE FROM tblUsers WHERE tblUsers_ID = ?', [id], callback);
};

let filenameStore;
var storage = multer.diskStorage({
  destination: (req, image, cb) => {
    cb(null, imagePath + 'tempFile')
  },
  filename: function (req, image, cb) {
    filenameStore = Date.now() + '_' + image.originalname;
    cb(null, filenameStore);
  }
})

var uploadMulter = multer({ storage: storage });

let filePath;
var imageUpload = function (req, res, next) {
  if (!req.file) {
    console.log("No file received");
    return res.status(200).json([ { success: 0 } ])
    // return res.send([0]);

  } else {
    console.log('file received');
    filePath = 'tempFile/' + filenameStore;
    return res.status(200).json([ filePath ])
    // return res.send([1, filePath])
  }
};





exports.signup = signup;
exports.login = login;
exports.forgetPassword = forgetPassword;
exports.allUsers = allUsers;
exports.singleUser = singleUser;
exports.deleteUser = deleteUser;
exports.imageUpload = imageUpload;
exports.uploadMulter = uploadMulter;
// exports.updateUser = updateUser;





















// previes code 

// Update a user
// callback(err)
// var updateUser = ((req, res) => {
//   // Check that the user logging in exists
//   db.query('SELECT * FROM tblUsers WHERE ID = ?', [req.body.id], function (err, rows) {

//     if (err)
//       return res.status(500).send(err);

//     // if user not found return Invalid Username
//     if (!rows.length)
//       return res.status(401).json({ message: 'User does not exists. !!' });

//     if (rows.length) {
//       //setValue here for updation
//     }
//     return res.status(401).json({ message: 'Invalid Username Password.' });

//   });
// });





// Set up User class
// var User = function (user) {
//   var that = Object.create(User.prototype);
//   that.id = user.id;
//   that.email = user.email;
//   that.password = user.password;

//   return that;
// };

// Create a new user
// callback(err, newUser)
// var createUser = function(email, password, callback) {
//   var newUser = {
//     id: generateUserId(),
//     email: email,
//     password: hashPassword(password)
//   };
//   db.query('INSERT INTO tblUsers ( ID, Name, password ) values (?,?,?)',
//     [newUser.id, newUser.email, newUser.password],
//     function(err) {
//       if (err) {
//         if (err.code === 'ER_DUP_ENTRY') {
//           // If we somehow generated a duplicate user id, try again
//           return createUser(email, password, callback);
//         }
//         return callback(err);
//       }

//       // Successfully created user
//       return callback(null, new User(newUser));
//     }
//   );
// };

// var createUser = function (req, res) {
//   var newUser = {
//     id: generateUserId(),
//     email: req.Name,
//     password: hashPassword(req.password)
//   };
//   db.query('INSERT INTO tblUsers ( ID, Name, password ) values (?,?,?)',
//     [newUser.id, newUser.email, newUser.password],
//     function (err) {
//       if (err) {
//         // if (err.code === 'ER_DUP_ENTRY') {
//         //   // If we somehow generated a duplicate user id, try again
//         //   return createUser(email, password, callback);
//         // }
//         return res.send(err);
//       }

//       // Successfully created user
//       return callback("Successfully") //getUser(newUser.id, callback);
//     }
//   );
// };

// var getUser = (req, res)=>{
  
// }

// Check if a user exists and create them if they do not
// callback(err, newUser)
// var signup = function(req, email, password, callback) {
//   debugger;
//   // Check if there's already a user with that email
//   db.query('SELECT * FROM tblUsers WHERE Name = ?', [email], function(err, rows) {
//     if (err)
//       return callback(err);

//     if (rows.length) {
//       return callback(null, false, req.flash('signupMessage', 'An account with that email address already exists.'));
//     } else {
//       // No user exists, create the user
//       return createUser(email, password, callback);
//     }
//   });
// };




// Log in a user
// callback(err, user)
// var login = function(req, email, password, callback) {
//   // Check that the user logging in exists
//   // db.query('SELECT * FROM tblUsers WHERE Name = ?', [email], function(err, rows) {
//   db.query('SELECT * FROM tblUsers WHERE Name = ?', [email], function (err, rows) {
//     console.log(rows);
//     if (err)
//       return callback(err);

//     if (!rows.length)
//       return callback(null, false, req.flash('loginMessage', 'No user found.'));

//     if (!validPassword(password, rows[0].password))
//       return callback(null, false, req.flash('loginMessage', 'Wrong password.'));

//     // User successfully logged in, return user
//     return callback(null, new User(rows[0]));
//   });
// };





