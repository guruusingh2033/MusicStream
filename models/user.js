// var uuidV4 = require('uuid/v4');
// const jwt = require('jsonwebtoken');
var db = require('./db');
const multer = require('multer');
var md5 = require('md5');
require('dotenv/config');
const { Validator } = require('node-input-validator');
// const nodemailer = require('nodemailer');

var signup = function (req, res) {
  // function for creating user in DB
  createUser(req, res);
};

// creating user in DB
var createUser = (req, res) => {
  // Set values of user
  var newUser = setUserValue(req);
  // Inserting user details in DB
  db.query('INSERT INTO tblUsers (name, password, email, Userimage, Usertype, status, MobileNo ) values (?,?,?,?,?,?,?)',
    [newUser.name, newUser.password, newUser.email, newUser.image, newUser.type, newUser.status, newUser.phone_no],
    function (err) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'An account with this email address already exists.' }])
        else
          return res.status(200).json([{ success: 'Fail to signup' }])
      }
      else {
        /* copy last uploaded image in permanent folder(registrationImages) and 
         remove images from temporary folder(tempFile) */
        fileCopy(req)
        // Successfully created user, now return user detail
        retriveUser(newUser.email, res)
      }
    }
  );
};

// function used in createUser and createArtist method
// getting value from request.body and setting in object
var setUserValue = (req) => {
  let newUser = {
    // id: generateUserId(),
    name: req.body.name,
    email: req.body.email,
    phone_no: req.body.phone_no,
    image: req.body.image,
    type: req.body.type,
    status: req.body.status,
    username: req.body.username,
    description: req.body.description
  };
  if (req.body.password)
    newUser.password = md5(req.body.password);
  // removing 'tempfile' for getting only image name
  if (req.body.image)
    newUser.image = req.body.image.replace('tempFile/', '');
  return (newUser);
}

//imagepath used in multer, fileCopy and deleteFile Function
const imagePath = '../test/images/registrationImages/'; 
// function used in signup function
// copy file from temporary folder(tempFile) to parmanent folder(registrationImages)
function fileCopy(req) { //
  if (req.body.image && filePath == req.body.image) {
    const fs = require('fs');
    let source = imagePath + req.body.image;
    let destination = imagePath + req.body.image.replace('tempFile/', '');
    // Copy dsingle file of folder
    fs.copyFile(source, destination, (err) => {
      if (err) throw err;
      console.log('Success Copy file');
      // delete file from temperaory folder 
      deleteFile(fs);
    });
  }
  else { console.log('image path not match with uploaded path'); }
}

// function used in fileCopy function
// delete file from temperaory folder 
function deleteFile(fs) {
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
// return User detail from database
function retriveUser(email, res) {
  db.query('SELECT * FROM tblUsers WHERE email = ?', [email], function (err, rows) {
   if (err) return res.send([{ success: 'Fail to retrive user detail' }]);
    // if user not found return Invalid Username
    if (rows.length == 0)
      return res.status(200).json([{ success: 'Email not registered' }])
    //adding success element in rows object   
    rows[0].success = "Please wait for admin to approve. We will contact you shortly";
    //sendEmail(rows[0]); // send mail to admin
    return res.status(201).json([rows[0]]);
  });
}

var login = function (req, res) {
  // Check that the user logging in exists
  db.query('SELECT * FROM  tblUsers WHERE email = ?', [req.body.email], function (err, rows) {
    if (err) return res.status(200).json([{ success: 'Fail to loggedin' }])
    // if user not found return Invalid Username
    if (rows.length == 0) return res.status(200).json([{ success: 'Fail to loggedin, Email not registered' }]);
    // if valid password User successfully logged in, return username with token
    if (md5(req.body.password) === rows[0].Password) {
      // function for generating token with JWT
      // const tokenStore = generateToken(rows);
      //return res.status(200).send([1, rows[0].Email, tokenStore]);
      rows[0].success = 'Successfully loggedin';
      return res.status(200).json([rows[0]]);
    }
    return res.status(200).json([{ success: 'Fail to loggedin, Password invalid' }]);
  });
};

// check email from db, if email exists return user detail
var forgetPassword = (req, res) => {
  retriveUser(req.body.email, res)
}

// return all users from database
var allUsers = (req, res) => {
  db.query('SELECT * FROM tblUsers', [], function (err, rows) {
    if (err)
      return res.status(200).json([{ success: 'Fail to get all users' }]);
    rows[0].success = 'Successfully get all users';
    return res.status(200).json(rows);
  });
};

// get single users
var singleUser = (req, res) => {
  const id = req.body.id; // get id from body
  if (!id)
    return res.status(200).json([{ success: 'Invalid Id' }])
  db.query('SELECT * FROM tblUsers WHERE tblUsers_ID = ?', [id], function (err, rows) {
    if (err)
      return res.status(200).json([{ success: 'Fail to get single user' }])
    if (rows.length === 0)
      return res.status(200).json([{ success: 'Id does not exists' }])
    rows[0].success = 'Successfully get single user';
    return res.status(200).json(rows)
  });
};
// Delete a user
// callback(err)
// var deleteUser = function (req, callback) {
//   const id = req.params.id; // get id from url
//   db.query('DELETE FROM tblUsers WHERE tblUsers_ID = ?', [id], callback);
// };

// set destionation and file name for saving in folder using multer
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
// uploading image on server
var uploadMulter = multer({ storage: storage });

// return response image is uploaded or not
let filePath;
var imageUpload = function (req, res) {
  if (!req.file) {
    console.log("No file received");
    return res.status(200).json([{ success: 'Fail to upload image, No image received' }])
  } else {
    console.log('file received');
    filePath = 'tempFile/' + filenameStore;
    return res.status(200).json([{ filePath: filePath, success: 'Successfully uploaded image' }])
  }
};

// MiddleWare for validation
var signUpValidation = async (req, res, next) => {
  let v;
  if (req.body.type == 3) {
    v = new Validator(req.body, {
      image: 'required',
      email: 'required|email',
      password: 'required'
    });
  } else {
    v = new Validator(req.body, {
      email: 'required|email',
      password: 'required'
    });
  }
  const matched = await v.check();
  if (!matched) {
    req.status = 422;
    req.body = v.errors;
    v.errors.success = "Validation error";
    res.status(422).send([v.errors]);
  } else {
    next();
  }
};

var artist = function (req, res) {
  // function for creating user in DB
  createArtist(req, res);
};
var createArtist = (req, res) => {
  // Set values of user
  var newUser = setUserValue(req);
  // Inserting user details in DB
  db.query('INSERT INTO tblUsers (name, email, Usertype, status, MobileNo, Description ) values (?,?,?,?,?,?)',
    [newUser.name, newUser.email, newUser.type, newUser.status, newUser.phone_no, newUser.description],
    function (err) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'An account with this email address already exists.' }])
        else
          return res.status(200).json([{ success: 'Fail to signup' }])
      }
      else {
        // Successfully created user, now return user detail
        retriveUser(newUser.email, res)
      }
    }
  );
};

var artistValidation = async (req, res, next) => {
  let v = new Validator(req.body, {
    email: 'required|email',
    name: 'required',
    phone_no: 'required|integer|min:1',
    description: 'required',
    status: 'required',
    type: 'required',
  });
  const matched = await v.check();
  if (!matched) {
    req.status = 422;
    req.body = v.errors;
    v.errors.success = "Validation error";
    if (v.errors.phone_no)
      v.errors.phone_no.message = "Phone number invalid"; // custom validate message for phone number
    res.status(422).send([v.errors]);
  } else {
    next();
  }
};

// var sendEmail = async (data) =>{
//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     service: "Gmail", // comment this for test
//     auth: {
//       user: process.env.GMAIL_USER, // generated ethereal user
//       pass: process.env.GMAIL_PASSWORD // generated ethereal password
//     }
//   });

//   messageBody = '<h2>There is details of created new artist </h2>' 
//     + '<br>Name           ::: ' + data.Name
//     + '<br>Email          ::: ' + data.Email
//     + '<br>Phone No.      ::: ' + data.MobileNo
//     + '<br>Description    ::: ' + data.Description;

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '<test@example.com>', // sender address
//     to: 'test1@gmail.com, test2@gmail.com', // list of receivers
//     subject: 'New Artist Created ✔', // Subject line
//     text:  'Detail of Created New Artist ', // plain text body
//     html: messageBody,// html body
//   });

//   console.log('Message sent: %s', info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
//   console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

exports.signup = signup;
exports.login = login;
exports.forgetPassword = forgetPassword;
exports.allUsers = allUsers;
exports.singleUser = singleUser;
exports.imageUpload = imageUpload;
exports.uploadMulter = uploadMulter;
exports.signUpValidation = signUpValidation;
exports.artist = artist;
exports.artistValidation = artistValidation;
// exports.deleteUser = deleteUser;
// exports.updateUser = updateUser;





















// previes code 


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



// used in signup function 
// Gets a random id for this user
// var generateUserId = function () {
//   return uuidV4();
// };
// Note: this function no longer need due to Id cloumn auto-increament

// used in signup function 
// Hash and salt the password with bcrypt
// var hashPassword = function (password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };
// Note : used MD5 instead bcrypt algo

// for forget email
// db.query('SELECT * FROM tblUsers WHERE email = ?', [req.body.email], function (err, rows) {

  //   // if (err)
  //   //   return res.status(500).json([ { success: 'Fail forget password' } ])
  //     // return res.status(500).send([0, err]);

  //     // return res.status(401).send([0, 'Email not registered.']);

  //   // if Email valid return password
  //   if (req.body.email === rows[0].Email) {   
  //     rows[0].success = 'Successfully done forgetPassword';
  //     return res.status(200).json([ rows[0] ])
  //     // return res.status(200).send([1, rows[0].Password]);
  //   }
  //   return res.status(200).json([{ success: 'Fail to forgetPassword' } ]);
  //   // return res.status(401).send([0, 'Email not registered.']);

  // });



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