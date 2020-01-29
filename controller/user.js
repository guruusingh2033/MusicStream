// var uuidV4 = require('uuid/v4');
// const jwt = require('jsonwebtoken');
const multer = require('multer');
// var md5 = require('md5');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('MusicStreammyTotalySecretKey');
require('dotenv/config');
var db = require('./connection');
var  nodemailer = require("nodemailer");
var emailConfig = require('../config/email')

var signup = function (req, res) {
  const userType = parseInt(req.body.type);
  // Condtions for updation
  switch (userType) {
    // case 1: insertUser(req, res); break;
    case 2: insertUser(req, res); break;
    // case 3: insertArtist(req, res); break;
    default: return res.status(200).json([{ success: 'Invalid userType, Fail to signup' }])
  }
  // function for creating user in DB
  // createUser(req, res);
};

// creating user in DB
// var createUser = (req, res) => {
//   // Set values of user
//   var newUser = setUserValue(req);
//   // Inserting user details in DB
//   db.query('INSERT INTO tblUsers (Name, Password, Email,  Usertype, Userimage, Status , MobileNo, Description, UserName) values (?,?,?,?,?,?,?,?,?)',
//     [newUser.name, newUser.password, newUser.email, newUser.type, newUser.image, newUser.status, newUser.phone_no, newUser.description, newUser.userName],
//     function (err) {
//       if (err) {
//         // Check for dupicate email
//         if (err.code === 'ER_DUP_ENTRY')
//           return res.status(200).json([{ success: 'An account with this email address already exists.' }])
//         else
//           return res.status(200).json([{ success: 'Fail to signup', error:err }])
//       }
//       else {
//         /* copy last uploaded image in permanent folder(registrationImages) and 
//          remove images from temporary folder(tempFile) */
//         fileCopy(req)
//         // Successfully created user, now return user detail
//         retriveUser(newUser.email, res)
//       }
//     }
//   );
// };

function insertUser(req, res){
  //setValue here for insertion
  const userFields = setUserValue(req);  
  // Inserting user details in DB 
  db.query('CALL sp_insertUser(?,?,?,?,?,?,?)', 
    [userFields.name, userFields.password, userFields.email, userFields.userName, userFields.type, userFields.status, userFields.phone_no],
    function (err, rows) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'May userName/email/phone no. already exists.' }])
        else
          return res.status(200).json([{ success: 'Fail to signup', error: err }])
      }
      else if (rows.affectedRows != 0) {
        // Successfully insert user, now return user detail
        retriveUser(userFields.email, res, 'signup')
      }
      else
        return res.status(200).json([{ success: 'Fail to signup', error: err }])
    }
  );
}

// function insertArtist(req, res) {
//   //setValue here for insertion
//   const artistFields = setUserValue(req);
//   // Inserting artist details in DB 
//   db.query('CALL sp_insertArtist(?,?,?,?,?,?,?,?,?)',
//     [artistFields.name, artistFields.password, artistFields.email, artistFields.phone_no, artistFields.image,  artistFields.description, artistFields.userName, artistFields.type, artistFields.status],
//     function (err, rows) {
//       if (err) {
//         // Check for dupicate email
//         if (err.code === 'ER_DUP_ENTRY')
//           return res.status(200).json([{ success: 'An account with this email address already exists.' }])
//         else
//           return res.status(200).json([{ success: 'Fail to signup', error: err }])
//       }
//       else if (rows.affectedRows != 0) {
//         fileCopy(req);
//         // Successfully signup artist, now return user detail
//         retriveUser(artistFields.email, res, 'signup')
//       } else
//         return res.status(200).json([{ success: 'Fail to signup', error: err }])
//     }
//   );
// }


// function used in createUser and createArtist method
// getting value from request.body and setting in object
var setUserValue = (req) => {
  let newUser = {
    // id: generateUserId(),
    name: req.body.name,
    email: req.body.email,
    phone_no: req.body.phone_no,
    image: req.body.image,
    type: parseInt(req.body.type),
    status: parseInt(req.body.status),
    description: req.body.description,    
  };
  if (req.body.userName)
    newUser.userName = req.body.userName;
  else
    newUser.userName = req.body.email;
  if (req.body.password)
    newUser.password = cryptr.encrypt(req.body.password);
  // removing 'tempfile' for getting only image name
  if (req.body.image)
    newUser.image = req.body.image.replace('tempFile/', '');
  return (newUser);
}

//imagepath used in multer, fileCopy and deleteFile Function
const imagePath = 'images/registrationImages/'; // live path
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
function retriveUser(email, res, checkApi) {
  db.query('CALL sp_retriveUserWithEmail(?)', [email], function (err, rows) {
    if (err) return res.status(200).json([{ success: 'Fail to retrive user detail' , error:err}]);
    // if user not found return Invalid Username
    if (rows[0].length == 0)
      return res.status(200).json([{ success: 'Email not registered' }])
      
    //adding success element in rows object 
    if ((rows[0][0].UserType == 2 || rows[0][0].UserType == 1) && checkApi == 'signup')
        rows[0][0].success = "Successfully registred";
    else if (rows[0][0].UserType == 3 && checkApi == 'signup')      
      rows[0][0].success = "Please wait for admin to approve. We will contact you shortly"; 
    else if (checkApi == 'forgetPassword')
      rows[0][0].success = "Success forget password";   
    else if (checkApi == 'createArtist') {
      rows[0][0].success = "Please wait for admin to approve. We will contact you shortly";     
    }        
    else
      rows[0][0].success = "Successfully edited";
    return res.status(200).json([rows[0][0]]);
  });
}

var login = function (req, res) {
  // Check that the user logging in exists
  db.query('CALL sp_Login(?)', [req.body.userName], function (err, rows) {
    if (err) return res.status(200).json([{ success: 'Fail to loggedin', error:err}])
    // if user not found return Invalid Username
    if (rows[0].length == 0) return res.status(200).json([{ success: 'Fail to loggedin, Email not registered' }]);
    // if valid password User successfully logged in, return username with token
    if (req.body.password === cryptr.decrypt(rows[0][0].Password)) {
      // function for generating token with JWT
      // const tokenStore = generateToken(rows);
      //return res.status(200).send([1, rows[0].Email, tokenStore]);
      rows[0][0].success = 'Successfully loggedin';
      return res.status(200).json(rows[0]);
    }
    return res.status(200).json([{ success: 'Fail to loggedin, Password invalid' }]);
  });
};

// check email from db, if email exists return user detail
var forgetPassword = (req, res) => {
  retriveUser(req.body.email, res, 'forgetPassword')
}

// return all users from database
var allUsers = (req, res) => {
  db.query('CALL sp_AllUsers()', [], function (err, rows) {
    if (err)
      return res.status(400).json([{ success: 'Fail to get all users', error:err }]);
    if (rows.length == 0)
      return res.status(200).json([{ success: 'Table is empty'}]);
    rows[0][0].success = 'Successfully get all users';
    return res.status(200).json(rows[0]);
  });
};

// get single users
var singleUser = (req, res) => {
  const id = req.body.id; // get id from body
  if (!id)
    return res.status(200).json([{ success: 'Invalid Id' }])
  db.query('CALL sp_retriveUserWithID(?)', [id], function (err, rows) {
    if (err)
      return res.status(200).json([{ success: 'Fail to get single user', error:err }])
    if (rows[0].length === 0)
      return res.status(200).json([{ success: 'Id does not exists' }])
    // decrypting password
    if (rows[0][0].Password)
      rows[0][0].Password = cryptr.decrypt(rows[0][0].Password);
    rows[0][0].success = 'Successfully get single user';
    return res.status(200).json(rows[0])
  });
};

// set destionation and file name for saving in folder using multer
let filenameStore;
var storage = multer.diskStorage({
  // accept image files only   
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only jpg,jpeg,png,gif image files are allowed!'), false);
    }
    cb(null, true);
  },
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

var artist = function (req, res) {
  // function for creating user in DB
  createArtist(req, res);
};
var createArtist = (req, res) => {
  // Set values of user
  var newUser = setUserValue(req);
  // Inserting user details in DB
   db.query('CALL sp_createArtist(?,?,?,?,?,?)',
    [newUser.name, newUser.email, newUser.type, newUser.status, newUser.phone_no, newUser.description],
     function (err) { // async
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY') 
          return res.status(200).json([{ success: 'May userName/email/phone no. already exists.'}])
        else
          return res.status(200).json([{ success: 'Fail to signup', error:err}])
      }
      else {
        // send email to admin and artist
        let response = sendEmailToAdmin(newUser); // await
        res.emailMsg = response;
        // Successfully created user, now return user detail
        retriveUser(newUser.email, res, 'createArtist')                 
      }
    }
  );
};

/** Code Start:: update user and artist */
// Update a user
// callback(err)
var editProfile = ((req, res) => {   
  const userType = parseInt(req.body.type); 
  // Condtions for updation
  switch (userType) {
    case 2: updateUser(req, res); break;
    case 3: updateArtist(req, res); break;
    default: return res.status(200).json([{ success: 'Invalid userType, Fail to update' }])
  }
});

function updateUser(req, res){
  //setValue here for updation
  const userFields = setUserValue(req);
  const id = req.body.id;
  // Inserting user details in DB 
  db.query('CALL sp_updateUser(?,?,?,?,?,?,?)',
    [userFields.name, userFields.password, userFields.email, userFields.phone_no, userFields.userName, id, userFields.type],
    function (err, rows) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'May userName/email/phone no. already exists.' }])
        else
          return res.status(200).json([{ success: 'Fail to update', error: err }])
      }
      else if (rows.affectedRows != 0) {
          /* copy last uploaded file in permanent folder and 
           remove images from temporary folder */
          fileCopy(req);
        // Successfully updated user, now return user detail
        retriveUser(userFields.email, res, 'updateUser')
      }
      else
        return res.status(200).json([{ success: 'Fail to update, Invalid UserType or ID', error: err }])
    }
  );
}

function updateArtist(req, res) {
  //setValue here for updation
  const artistFields = setUserValue(req);
  const id = req.body.id;
  // Inserting artist details in DB 
  db.query('CALL sp_updateArtist(?,?,?,?,?,?,?,?,?)',
    [
      artistFields.name, 
      artistFields.password, 
      artistFields.email, 
      artistFields.phone_no,
      artistFields.image, 
      artistFields.description, 
      artistFields.userName, 
      id, 
      artistFields.type
    ],
    function (err, rows) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'May userName/email/phone no. already exists.' }])
        else
          return res.status(200).json([{ success: 'Fail to update', error: err }])
      }
      else if (rows.affectedRows != 0){
        /* copy last uploaded file in permanent folder and 
           remove images from temporary folder */
        fileCopy(req);
        // Successfully updated artist, now return user detail
        retriveUser(artistFields.email, res, 'updateArtist')
      }else
        return res.status(200).json([{ success: 'Fail to update, Invalid UserType or ID', error: err }])
    }
  );
}
/** Code End:: update user and artist */

// delete profile with id 
const deleteProfile = (req,res) =>{
  db.query('CALL sp_DeleteProfile(?)', [req.body.id], (err, rows)=>{
    if(err)
      return res.status(200).json([{ success: 'May be some connection error ', error: err }])
    else if (rows.affectedRows != 0)
      return res.status(200).json([{ success: 'Record Deleted Successfully ' }])
    else
      return res.status(200).json([{ success: 'Fail to delete record, Id should be valid' }])
  });
}
// delete each and everything of aritst records and files
const delProfileArtist = async (req, res) => {
  await db.query('CALL sp_retriveUserWithID(?); CALL sp_MediaByArtistId(?); CALL sp_ArtitstDeleteProfile(?)',
    [req.body.id, req.body.id, req.body.id], async (err, rows) => {
    if (err)
      return res.status(200).json([{ success: 'May be some connection error ', error: err }])
      // let delThumbnailPath = [];  
     
      if (rows[2].length > 0){      
        for (let i=0; i< rows[2].length; i++) {
          // delThumbnailPath.push((rows[2][0].ThumbnailPath));
          await deleteArtistMediaImages(rows[2][i].ThumbnailPath);
          await deleteArtistVideos(rows[2][i].FilePath); 
          await deleteArtistAudios(rows[2][i].FilePath);         
        }        
      }
      if (rows[0].length > 0) {
        for (let i = 0; i < rows[0].length; i++) {
          // delThumbnailPath.push((rows[2][0].ThumbnailPath));
          await deleteArtistProfileImages(rows[0][i].UserImage);
        }
      }
      if (rows[4].affectedRows > 0) {
        return res.status(200).json([{ success: 'Record deleted' }])
      }
      else{
        return res.status(200).json([{ success: 'Record not deleted' }])
      }      
  });
}

// function used in delProfileArtist
// delete file from thumbnail_Images
async function deleteArtistMediaImages(thumbnailPath) {
  if (thumbnailPath !== null){
    const fs = require('fs');
    const path = require('path');
    const directory = 'songs/thumbnail_Images/';  // live path
    await fs.readdir(directory, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file === thumbnailPath){
          await fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            msg = 'successfully deleted ' + file;
            console.log('successfully deleted ' + file);
          });
        }        
      }
    });
  }  
}

// function used in delProfileArtist
// delete file video files
async function deleteArtistVideos(filePath) {
  if (filePath !== null) {
    const fs = require('fs');
    const path = require('path');
    const directory = 'songs/VideoSongs/'; // live path
    await fs.readdir(directory, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file === filePath) {
          await fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            msg = 'successfully deleted ' + file;
            console.log('successfully deleted ' + file);
          });
        }
      }
    });
  }  
}

// function used in delProfileArtist
// delete file audio files
async function deleteArtistAudios(filePath) {
  if (filePath !== null) {
    const fs = require('fs');
    const path = require('path');
    const directory = 'songs/AudioSongs/'; // live path
    await fs.readdir(directory, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file === filePath) {
          await fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            msg = 'successfully deleted ' + file;
            console.log('successfully deleted ' + file);
          });
        }
      }
    });
  }
}

// function used in delProfileArtist
// delete file from images/registrationImages
async function deleteArtistProfileImages(userImage) {
  if (userImage !== null)
  {
    const fs = require('fs');
    const path = require('path');
    const directory = imagePath;
    await fs.readdir(directory, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file === userImage){
          await fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            msg = 'successfully deleted ' + file;
            console.log('successfully deleted ' + file);
          });
        }
      }
    });
  }
  
}

// get all user having type 2
const allUserType2 = (req,res) =>{
  db.query('CALL sp_AllUsersType2()', [], function (err, rows) {
    if (err)
      return res.status(200).json([{ success: 'Fail to get all users type 2', error: err }]);
    if (rows.length == 0)
      return res.status(200).json([{ success: 'Table is empty' }]);
    rows[0][0].success = 'Successfully get all users';
    return res.status(200).json(rows[0]);
  });
}

var sendEmailToAdmin = (data) => { // async
  // let keys = [];
  // keys.push(Object.keys(data));
  // console.log(keys);  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure, // true for 465, false for other ports
    debug: emailConfig.debug,
    auth: {
      user: emailConfig.auth.user, //process.env.GMAIL_USER, // generated ethereal user
      pass: emailConfig.auth.pass //process.env.GMAIL_PASSWORD // generated ethereal password
    },
    tls: {
      rejectUnauthorized: emailConfig.tls.rejectUnauthorized
    }
  });

  let messageBody = '<p>Hello Admin,</p>' 
    + '<p>A new artist has requested for approval. Please approve/decline request on Shyam Parivar admin portal.</p>'
    + '<table style="border-collapse: collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;"><tr><th colspan="2" style="background:#f3f3f3;border: 1px solid #ccc;padding: 10px;"> <img style="width:130px" src="' + emailConfig.baseUrl + 'shyamlogo.png"></th></tr>'
    + '<tr><th colspan="2" style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">Artist details </h2></th></tr>'
    + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px">Name:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.name + '</td></tr>'
    + '<tr><td style="border: 1px solid #ccc; padding:10px">Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.email+'</td></tr>'
    + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data.phone_no + '</td></tr>'
    + '<tr><td style="border: 1px solid #ccc; padding:10px">Description: </td><td style="border: 1px solid #ccc; padding:10px">' + data.description +'</td></tr>'
    + '<tr><td colspan="2" style="text-align: center;border: 1px solid #ccc; padding:10px"><b style="color:#c97328">Shyam Mobile</b><br><p style="margin: 0;">Shop no. 47, Hisar Road, Bhattu Mandi, </p><p style="margin: 0;">Fatehabad, Haryana 125053<p><p style="margin: 10px 0;"><strong style="color:#c97328">Mobile Number:</strong> +91-9254622222 +91-9017822222</p><p style="margin: 0;"><strong style="color:#c97328">Email:</strong> shyammobilepalace@gmail.com</p></td></tr>'
    +'</table>';

  let mailOptions = {
    from: emailConfig.from, // sender address
    to: emailConfig.to, // list of receivers
    subject: 'New Artist Request', // Subject line
    // text: 'Detail of Created New Artist ' + messageBody, // plain text body
    html: messageBody,// html body
  };

  let response;
  // send mail with defined transport object
  transporter.sendMail(mailOptions).then(result => { // await
    console.log('Email send successfull sent: %s', result);
    response = { EmailSend: true, msg: "Successfully send email " };
  }).catch(err => {
    console.log('Error while sending email : %s', err);
    response = { EmailSend: false, msg: "Fail to send e-mail " + err };
  })
  return response;
}

function editProfilebyAdmin(req, res) {
  //setValue here for updation
  const fields = setUserValue(req);
  const artistId = req.body.artistId;
  // Inserting artist details in DB 
  db.query('CALL sp_UpdateByAdmin(?,?,?,?,?,?,?)',
    [
      fields.name,
      fields.password,
      fields.email,
      fields.phone_no,
      fields.description,
      fields.userName,
      artistId
    ],
    function (err, rows) {
      if (err) {
        // Check for dupicate email
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(200).json([{ success: 'May userName/email/phone no. already exists.' }])
        else
          return res.status(200).json([{ success: 'Not updated', error: err }])
      }
      else if (rows.affectedRows != 0) {
        /* copy last uploaded file in permanent folder and 
           remove images from temporary folder */
        fileCopy(req);

        return res.status(200).json([{ success: 'Updated'}])
      } else
        return res.status(200).json([{ success: 'Not updated', error: err }])
    }
  );
}

// insert check value in tblUser in DB
var insertCheckValue = (req, res) => {
  // Inserting value in DB
  db.query('CALL sp_UserInsertCheckValue(?,?)',
    [req.body.id, req.body.checkValue],
    function (err, rows) {
      if (err) {
        return res.status(200).json([{ success: 'Fail to insert', error: err }])
      }
      if (rows.affectedRows != 0) {
        return res.status(200).json([{ success: 'Inserted' }])
      } else {
        return res.status(200).json([{ success: 'Not inserted', error: err }])
      }
    }
  );
};

// insert artitst Like in tblArtistLiking in DB
const insertArtistLike = (req, res) => {
  db.query("CALL sp_ArtistLikingInsert(?, ?, ?, @p_return);", [req.body.userId, req.body.artistId, req.body.like], (err, rows) => {
    if (err)
      return res.status(200).json({ succes: "Internal Server error ", err: err })
    // if rows[0][0].p_return == 3 successfuly updated value 
    if (rows[0][0].p_return > 0) {
      return res.status(200).json([{ success: 'Yes' }]);
    }
    if (rows[0][0].p_return == -1)
      return res.status(200).json([{ success: 'User does not exists' }]);
    if (rows[0][0].p_return == -2)
      return res.status(200).json([{ success: 'Artist does not exists' }]);

    return res.status(200).json([{ success: 'No' }]);
  })
}

const fetchLikesOfParticularUser = (req, res) => {
  db.query("CALL sp_ArtistLikingFetchForParticularUser(?, ?);", [req.body.userId, req.body.artistId], (err, rows) => {
    if (err)
      return res.status(200).json({ succes: "Internal Server error ", err: err })
    if (rows[0].length > 0) {
      return res.status(200).json([{ success: rows[0][0].Liking }]);
    }
    return res.status(200).json([{ success: 'No record found' }]);
  })
};

const artistLikingAdminIncrement = (req, res) => {
  db.query("CALL sp_ArtistLikingAdminIncrementInsert(?, ?, @p_return);", [req.body.artistId, req.body.incrementValue], (err, rows) => {
    if (err){
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(200).json([{ success: 'Duplicate Entry' }])
      }
      return res.status(200).json({ succes: "Internal Server error ", err: err })
    }     
    if (rows[0][0].p_return == -2)
      return res.status(200).json([{ success: 'Artist does not exists' }]); 

    // if rows[0][0].p_return == 3 successfuly updated value 
    if (rows[0][0].p_return > 0) {
      return res.status(200).json([{ success: 'Inserted' }])
    } else {
      return res.status(200).json([{ success: 'Not inserted', error: err }])
    }
  })
};

const fetchTotalLikesOfArtist = (req, res) => {
  db.query("CALL sp_fetchTotalLikessOfArtist(?);", [req.body.artistId], (err, rows) => {
    if (err)
      return res.status(200).json({ succes: "Internal Server error ", err: err })
    if (rows[0].length > 0) {
      return res.status(200).json([{ success: rows[0][0].SumOfAdminArtistLike }]);
    }
    return res.status(200).json([{ success: 'No record found' }]);
  })
}

const loginWithOtpInsert = (req, res) =>{
  const userFields = setUserValue(req);
  // Inserting user details in DB 
  db.query('CALL sp_loginWithOtpInsert(?,?,?)',
    [userFields.phone_no, userFields.type,userFields.status ],
    function (err, rows) {
      if (err) {
          return res.status(200).json([{ success: 'Fail to insert', error: err }])
      }     
      if (rows[0][0].Id) {        
        return res.status(200).json([rows[0][0]])
      } else {
        return res.status(200).json([{ success: 'Not inserted', error: err }])
      }
    }
  );
}

exports.signup = signup;
exports.login = login;
exports.forgetPassword = forgetPassword;
exports.allUsers = allUsers;
exports.singleUser = singleUser;
exports.imageUpload = imageUpload;
exports.uploadMulter = uploadMulter;
exports.artist = artist;
exports.editProfile = editProfile;
exports.deleteProfile = deleteProfile;
exports.allUserType2 = allUserType2;
exports.editProfilebyAdmin = editProfilebyAdmin;
exports.insertCheckValue = insertCheckValue;
exports.insertArtistLike = insertArtistLike;
exports.fetchLikesOfParticularUser = fetchLikesOfParticularUser;
exports.artistLikingAdminIncrement = artistLikingAdminIncrement;
exports.fetchTotalLikesOfArtist = fetchTotalLikesOfArtist;
exports.loginWithOtpInsert = loginWithOtpInsert;
exports.delProfileArtist = delProfileArtist;





















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