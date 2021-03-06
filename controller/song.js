const multer = require('multer'); // for uploading files
const db = require('./connection');
require('dotenv/config');
const deleteFileService = require('../service/deleteFilesService');

// Variabele used for image uploading, copying and deleting 
//imagepath used in multer, fileCopy and deleteFile Function
const imageFolderPath = 'songs/thumbnail_Images/'; // live path
let tempImageNameStore; // storing image name with foldername like - tempThumbImage/abc.png
let thumbnailImageName; // storing only image name like - 1571724607849_Capture.png
/***  Code Start:: Thumb Image Upload  ***/
// set destionation and file name for saving in folder using multer
var thumbStorage = multer.diskStorage({
    // accept image files only   
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only jpg,jpeg,png,gif image files are allowed!'), false);
        }
        cb(null, true);
    },
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
const songFolderPath = 'songs/'; // live path
let songName; // for storing only song name --- 1571724607849.mp3
let tempSongNameStore; // storing image name with folder name like - tempFile/1571724607849.mp3
/***  Code Start:: Song Upload  ***/
// set destionation and file name for saving in folder using multer
var storage = multer.diskStorage({
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
    db.query('CALL sp_songInsert(?,?,?,?,?)',
        [newSong.name, newSong.artistId, newSong.type, newSong.filePath, newSong.thumbnailPath],
        function (err, rows) {
            if (err) {
                return res.status(200).json([{ success: 'Fail to insert song', error:err }])
            }
            if (rows.affectedRows != 0) {
                /* copy last uploaded file in permanent folder and 
                 remove images from temporary folder */
                fileCopy(req)
                // Successfully created Song, now return Song detail
                retriveSong(newSong.name, res)
            }else{
                return res.status(200).json([{ success: 'No row affected in DB', error: err }])
            }
        }
    );
};

// Delete a record from tblMedia on basis of artist Id and tblMedia Id
var deleteMediaArtIdMedId = function (req, res) {
    const tblMedia_Id = req.body.tblMedia_Id; // get id from body
    const artistId = req.body.artistId; // get id body
    db.query('CALL sp_getMediaByMediaId(?); CALL sp_delMediaArtIdMedId(?,?)', [tblMedia_Id, tblMedia_Id, artistId], 
    async (err, rows) => {
        if (err) {
            res.status(200).json([{ success: 'Fail to delete, ArtistId and tableId should be valid', error: err }]);           
        }
        if (rows[0].length > 0) {
            for (let i = 0; i < rows[0].length; i++) {
                await deleteFileService.deleteArtistMediaImages(rows[0][i].ThumbnailPath);
                await deleteFileService.deleteArtistVideos(rows[0][i].FilePath);
                await deleteFileService.deleteArtistAudios(rows[0][i].FilePath);
            }
        }       
        if (rows[2].affectedRows > 0){
            res.status(200).json([{ success: 'Record deleted sucessfully' }])
        }
    });
};

// function used in createUser and createArtist method
// getting value from request.body and setting in object
var setSongValue = (req) => {
    let newSong = {
        name: req.body.name,
        artistId: req.body.artistId,
        type: req.body.type,
        filePath: req.body.filePath.replace('tempFile/', ''),
        thumbnailPath: req.body.thumbnailPath.replace('tempThumbImage/', ''),
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
        let extension = req.body.filePath.split('.').pop();
        let source = songFolderPath + req.body.filePath;
        let destination;
        const audioFolderPath = 'songs/audioSongs/'; // live path
        const videoFolderPath = 'songs/videoSongs/'; // live path
        if (extension == 'mp3'){
            destination = audioFolderPath + req.body.filePath.replace('tempFile/', '');
        }
        else{
            destination = videoFolderPath + req.body.filePath.replace('tempFile/', '');
        }
        
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
    db.query(' CALL sp_singleSong(?)', [name], function (err, rows) {
        if (err) return res.send([{ success: 'Fail to retrive song detail', err: err }]);
        //adding success element in rows object   
        rows[0][0].success = "Song successfully inserted";
        return res.status(200).json(rows[0]);
    });
}
/***   Code End:: inserting song detail into DB  ***/

/** Code Start:: get all songs and artist **/
var allSongsArtist = (req, res) => {
    db.query('CALL sp_allSongsArtist()', [], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get all song with artist name' , error:err}]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'Table is empty' }]);
        rows[0][0].success = 'Successfully get all song with artist name';
        return res.status(200).json(rows[0]);
    });
};
/** Code End:: get all songs and artist **/

/** Code Start:: get single songs and artist **/
var artistAllAudioSong = (req, res) => {
    const artistId = parseInt(req.body.artistId);
    db.query("CALL sp_artistAllAudioSong(?);", [artistId], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get single artist songs', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'No data found' }]);

        const message = 'Successfully get single artist songs';
        addSuccess(rows, message)       
        return res.status(200).json(rows[0]);        
    });
};

// add success with all array of object element
function addSuccess(rows, message){
    for (i = 0; i < rows[0].length; i++) {
        rows[0][i].success = message;
    }
}
/** Code End:: get single songs and artist **/

/** Code Start:: get all songs and artist **/
var allArtist = (req, res) => {
    db.query('CALL sp_AllArtist()', [], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get all artist', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'Table is empty' }]);

        rows[0][0].success = 'Successfully get all artist';
        return res.status(200).json(rows[0]);
    });
};
/** Code End:: get all songs and artist **/

const countMediaArtId = (req,res) => {
    db.query('CALL sp_CountMediaArtId(?)', [req.body.artistId], (err,rows) => {
        if (err)
            return res.status(200).json([{ success: 'Fail to get media', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'Table is empty' }]);
        if (rows[0][0].artistId == null)
            return res.status(200).json([{ success: 'Artist Id does not exists' }]);
        rows[0][0].success = 'Successfully get media';
        return res.status(200).json(rows[0]);
    })
}

/** Code Start:: get all songs and artist **/
const allVideosArtist = (req, res) => {
    db.query('CALL sp_AllVideosArtist()', [], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get all videos with artist name', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'Table is empty' }]);
        rows[0][0].success = 'Successfully get all videos with artist name';
        return res.status(200).json(rows[0]);
    });
};
/** Code End:: get all songs and artist **/

// return all videos of an artist
const allVideosWithArtistId = (req, res) => {
    const id = req.body.artistId;
    db.query("CALL sp_AllVideosWithArtistId(?)", [id], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get single artist videos', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'No data found'}]);
        const message = 'Successfully get single artist videos';
        addSuccess(rows, message) 
        return res.status(200).json(rows[0]);
    });
};

const noOfAudioNoOfVideo = (req, res)=>{
    db.query('CALL sp_NoOfAudioNoOfVideo()', [], function (err, rows) {
        if (err)
            return res.status(200).json([{ success: 'Fail to get records', error: err }]);
        if (rows[0].length == 0)
            return res.status(200).json([{"noOfAudio": 0, "noOfVideo": 0, success: 'Table is empty' }]);

        rows[0][0].success = 'Successfully get number of audio and video';
        return res.status(200).json(rows[0]);
    });
}

const dataOfUserAndMediaForSearching = (req,res)=>{
    db.query('CALL sp_DataOfUserAndMediaForSearching()', [], (err, rows)=>{
        if(err)
            return res.status(200).json([{ success: 'Fail to get records', error: err }]);
        if(rows[0].length == 0)
            return res.status(200).json([{ tblUsers_ID: 'Table is empty' }]);
        else{
            rows[0][0].success = 'Successfully get records of user and media';
            return res.status(200).json(rows[0]);
        }            
    })
}

exports.songUploadMulter = songUploadMulter;
exports.songUpload = songUpload;
exports.songInsert = songInsert;
exports.deleteMediaArtIdMedId = deleteMediaArtIdMedId;
exports.thumbUploadMulter = thumbUploadMulter;
exports.thumbImageUpload = thumbImageUpload;
exports.allSongsArtist = allSongsArtist;
exports.artistAllAudioSong = artistAllAudioSong;
exports.allArtist = allArtist;
exports.countMediaArtId = countMediaArtId;
exports.allVideosArtist = allVideosArtist;
exports.allVideosWithArtistId = allVideosWithArtistId;
exports.noOfAudioNoOfVideo = noOfAudioNoOfVideo;
exports.dataOfUserAndMediaForSearching = dataOfUserAndMediaForSearching;