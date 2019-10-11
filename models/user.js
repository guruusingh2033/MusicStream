var bcrypt = require('bcrypt-nodejs');
var uuidV4 = require('uuid/v4');

var db     = require('./db');

// Set up User class
var User = function(user) {
  var that = Object.create(User.prototype);
  that.id       = user.id;
  that.email    = user.email;
  that.password = user.password;

  return that;
};

// Gets a random id for this user
var generateUserId = function() {
  return uuidV4();
};

// Hash and salt the password with bcrypt
var hashPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is correct
var validPassword = function(password, savedPassword) {
  return bcrypt.compareSync(password, savedPassword);
};

// Create a new user
// callback(err, newUser)
// var createUser = function(email, password, callback) {
//   var newUser = {
//     id: generateUserId(),
//     email: email,
//     password: hashPassword(password)
//   };
//   db.query('INSERT INTO tblUsers ( tblUsers_ID, Name, password ) values (?,?,?)',
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

var createUser = function (req, res) {
  var newUser = {
    id: generateUserId(),
    email: req.Name,
    password: hashPassword(req.password)
  };
  db.query('INSERT INTO tblUsers ( tblUsers_ID, Name, password ) values (?,?,?)',
    [newUser.id, newUser.email, newUser.password],
    function (err) {
      if (err) {
        // if (err.code === 'ER_DUP_ENTRY') {
        //   // If we somehow generated a duplicate user id, try again
        //   return createUser(email, password, callback);
        // }
        return res.send(err);
      }

      // Successfully created user
      return callback("Successfully") //getUser(newUser.id, callback);
    }
  );
};

var getUser = (req, res)=>{
  
}

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


 var signup = function (req, res) {

  // Check if there's already a user with that email
   db.query('SELECT * FROM tblUsers WHERE Name = ?', [req.body.name], function (err, rows) {
    if (err)
      return res.status(500).send(err);

    if (rows.length) {
      return res.status(400).send({message: 'An account with that email address already exists.'});
    } else {

      var newUser = {
        id: generateUserId(),
        name: req.body.name,
        password: hashPassword(req.body.password)
      };
      db.query('INSERT INTO tblUsers ( tblUsers_ID, Name, password ) values (?,?,?)',
        [newUser.id, newUser.name, newUser.password],
        function (err) {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              // If we somehow generated a duplicate user id, try again
              return res.status(400).send(err);
            }
            return res.status(500).send(err);
          }

          db.query('SELECT * FROM tblUsers WHERE name = ?', [req.body.name], function (err, rows) {
            if (err) return res.send(err);
            return res.status(201).json({ Message:"Signup Sucessfull", User: rows[0].Name });
          });
        }
      );
    }
  });
};

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


var login = function (req, res) {
  // Check that the user logging in exists
  // db.query('SELECT * FROM tblUsers WHERE Name = ?', [email], function(err, rows) {
  db.query('SELECT * FROM tblUsers WHERE Name = ?', [req.body.name], function (err, rows) {
    console.log(rows);
    if (err)
      return res.status(500).send(err);

    if (!rows.length)
      return res.status(401).json({ Message:'Invalid Username Password.'});

    if (!validPassword(req.body.password, rows[0].Password))
      return res.status(401).json({ Message: 'Invalid Username Password.'});

    // User successfully logged in, return user
    return res.status(200).json({ Message: "Login Sucessfull", User: rows[0].Name });
  });
};


// List all users
// callback(err, users)
var listUsers = function(callback) {
  db.query('SELECT * FROM tblUsers', [], function(err, rows) {
    if (err)
      return callback(err);

    return callback(null, rows);
  });
};

// Delete a user
// callback(err)
var deleteUser = function(id, callback) {
  db.query('DELETE FROM tblUsers WHERE id = ?', [id], callback);
};

exports.signup = signup;
exports.login = login;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;
