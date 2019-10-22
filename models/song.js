const multer = require('multer');
const { Validator } = require('node-input-validator');
const db = require('./db');

// Variabele used for image uploading, copying and deleting 
//imagepath used in multer, fileCopy and deleteFile Function
const imageFolderPath = '../test/songs/thumbnail_Images/';
let tempImageNameStore; // storing image name with foldername like - tempThumbImage/abc.png
let thumbnailImageName; // storing only image name like - 1571724607849_Capture.png

/***  Code Start:: Thumb Image Upload  ***/
// set destionation and file name for saving in folder using multer
var thumbStorage = multer.diskStorage({
    destination: (req, image, cb) => {
        cb(null, imageFolderPath + 'tempThumbImage')
    },
    filename: function (req, image, cb) {
        thumbnailImageName = Date.now() + '_' + image.originalname;
        cb(null, thumbnailImageName);
    }
})
// uploading image on server
var thumbUploadMulter = multer({ storage: thumbStorage });
// return response image is uploaded or not
var thumbImageUpload = function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.status(200).json([{ success: 'Fail to upload image, No image received' }])
    } else {
        console.log('file received');
        tempImageNameStore = 'tempThumbImage/' + thumbnailImageName;
        return res.status(200).json([{ filePath: tempImageNameStore, success: 'Successfully uploaded image' }])
    }
};
/*** Code End:: Thumb Image Upload  ***/

// Variabele used for song uploading, copying and deleting 
// songFolderPath used in multer, fileCopy and deleteFile Function
const songFolderPath = '../test/songs/'; 
let songName; // for storing only song name --- 1571724607849.mp3
let tempSongNameStore; // storing image name with folder name like - tempFile/1571724607849.mp3

/***  Code Start:: Song Upload  ***/
// set destionation and file name for saving in folder using multer
var storage = multer.diskStorage({
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype !== 'image/png') {
    //         return cb(null, false, new Error('I don\'t have a clue!'));
    //     }
    //     cb(null, true);
    // },
    destination: (req, song, cb) => {
        cb(null, songFolderPath + 'tempFile')
    },
    filename: function (req, song, cb) {
        songName = Date.now() + '_' + song.originalname;
        cb(null, songName);
    }
})
// uploading song on server
var songUploadMulter = multer({ storage: storage });
// return response song is uploaded or not
var songUpload = function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.status(200).json([{ success: 'Fail to upload song, No song received' }])
    } else {
        console.log('file received');
        tempSongNameStore = 'tempFile/' + songName;
        return res.status(200).json([{ filePath: tempSongNameStore, success: 'Successfully uploaded song' }])
    }
};
/***  Code End:: Song Upload  ***/

/***   Code Start:: inserting song detail into DB  ***/
var songInsert = function (req, res) {
    // function for creating Song in DB
    createSong(req, res);
};
// creating Song in DB
var createSong = (req, res) => {
    // Set values of Song
    var newSong = setSongValue(req);
    // Inserting Song details in DB
    db.query('INSERT INTO tblMedia (Name, ArtistId, Type, FilePath, ThumbnailPath ) values (?,?,?,?,?)',
        [newSong.name, newSong.artistId, newSong.type, newSong.filePath, newSong.thumbnailPath],
        function (err) {
            if (err) {
                return res.status(200).json([{ success: 'Fail to insert song', error:err }])
            }
            else {
                /* copy last uploaded file in permanent folder and 
                 remove images from temporary folder */
                fileCopy(req)
                // Successfully created Song, now return Song detail
                retriveSong(newSong.name, res)
            }
        }
    );
};

// function used in createUser and createArtist method
// getting value from request.body and setting in object
var setSongValue = (req) => {
    let newSong = {
        name: req.body.name,
        artistId: req.body.artistId,
        type: req.body.type,
        filePath: req.body.filePath.replace('tempFile/', ''),
        thumbnailPath: req.body.thumbnailPath.replace('thumbImageTempFile/', ''),
    };
    return (newSong);
}

// function used in signup function
// copy file from temporary folder to parmanent folder
function fileCopy(req) { 
    copySongFile(req);
    copyThumbImageFile(req);   
}
// copy and deleting song File
function copySongFile(req){
    if (req.body.filePath && tempSongNameStore == req.body.filePath) {
        const fs = require('fs');
        let source = songFolderPath + req.body.filePath;
        let destination = songFolderPath + req.body.filePath.replace('tempFile/', '');
        // Copy dsingle file of folder
        fs.copyFile(source, destination, (err) => {
            if (err) throw err;
            console.log('Success Song Copy file');
            // delete file from temperaory folder 
            const directory = songFolderPath + 'tempFile'; // folder path, for removing files
            deleteFile(fs, directory); 
        });
    }
    else { console.log('song path not match with uploaded path'); }
}
// copy and deleting thumb Image File
function copyThumbImageFile(req) {
    if (req.body.thumbnailPath && tempImageNameStore == req.body.thumbnailPath) {
        const fs = require('fs');
        let source = imageFolderPath + req.body.thumbnailPath;
        let destination = imageFolderPath + req.body.thumbnailPath.replace('tempThumbImage/', '');
        // Copy dsingle file of folder
        fs.copyFile(source, destination, (err) => {
            if (err) throw err;
            console.log('Success Image Copy file');
            // delete file from temperaory folder 
            const directory = imageFolderPath + 'tempThumbImage'; // folder path, for removing files
            deleteFile(fs, directory); 
        });
    }
    else { console.log('image path not match with uploaded path'); }
}

// function used in fileCopy function
// delete file from temperaory folder 
function deleteFile(fs, directory) {
    const path = require('path');
    const directoryStore = directory;
    fs.readdir(directoryStore, (err, files) => {
        for (const file of files) {
            fs.unlink(path.join(directoryStore, file), err => {
                if (err) throw err;
                msg = 'successfully deleted ' + file;
                console.log('successfully deleted ' + file);
            });
        }
    });
}

// return Song detail from database
function retriveSong(name, res) {
    db.query('SELECT * FROM tblMedia WHERE name = ?', [name], function (err, rows) {
        if (err) return res.send([{ success: 'Fail to retrive song detail', err: err }]);
        //adding success element in rows object   
        rows[0].success = "Song successfully inserted";
        return res.status(201).json([rows[0]]);
    });
}
/***   Code End:: inserting song detail into DB  ***/

// MiddleWare for songValidation
var songValidation = async (req, res, next) => {
    let v = new Validator(req.body, {
        name: 'required',
        artistId: 'required',
        type: 'required',
        filePath: 'required',
        thumbnailPath: 'required',        
    });
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

/** Code Start:: get all songs and artist **/
var allSongsArtist = (req, res) => {
    db.query('SELECT tblMedia.tblMedia_Id, tblMedia.Name, tblMedia.ArtistId, tblMedia.Type,'
    +'tblMedia.FilePath, tblMedia.ThumbnailPath, tblUsers.Name FROM tblMedia'
    +'LEFT JOIN tblUsers ON tblUsers.tblUsers_ID = tblMedia.ArtistId', [], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get all song with artist name' , error:err}]);
            rows[0].success = 'Successfully get all song with artist name';
        return res.status(200).json(rows);
    });
};
/** Code End:: get all songs and artist **/


exports.songValidation = songValidation;
exports.songUploadMulter = songUploadMulter;
exports.songUpload = songUpload;
exports.songInsert = songInsert;
exports.thumbUploadMulter = thumbUploadMulter;
exports.thumbImageUpload = thumbImageUpload;
exports.allSongsArtist = allSongsArtist;