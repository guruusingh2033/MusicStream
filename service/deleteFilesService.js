const fs = require('fs');
const path = require('path');

// function used in delProfileArtist
// delete file from thumbnail_Images
const deleteArtistMediaImages = async function deleteArtistMediaImages(thumbnailPath) {
    if (thumbnailPath !== null) {
        const directory = 'songs/thumbnail_Images/';  // live path
        await fs.readdir(directory, async (err, files) => {
            if (err) throw err;
            for (const file of files) {
                if (file === thumbnailPath) {
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
const deleteArtistVideos =async function deleteArtistVideos(filePath) {
    if (filePath !== null) {
        const directory = 'songs/videoSongs/'; // live path
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
const deleteArtistAudios = async function deleteArtistAudios(filePath) {
    if (filePath !== null) {
        const directory = 'songs/audioSongs/'; // live path
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
const deleteArtistProfileImages = async function deleteArtistProfileImages(userImage) {
    if (userImage !== null) {        
        const directory = 'images/registrationImages/';
        await fs.readdir(directory, async (err, files) => {
            if (err) throw err;
            for (const file of files) {
                if (file === userImage) {
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
const deleteUserProfileImages = function deleteUserProfileImages(userImage) {
    if (userImage !== null) {
        const directory = 'images/registrationImages/';
        fs.readdir(directory, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                if (file === userImage) {
                    fs.unlink(path.join(directory, file), err => {
                        if (err) throw err;
                        msg = 'successfully deleted ' + file;
                        console.log('successfully deleted ' + file);
                    });
                }
            }
        });
    }
}

exports.deleteArtistMediaImages = deleteArtistMediaImages;
exports.deleteArtistVideos = deleteArtistVideos;
exports.deleteArtistAudios = deleteArtistAudios;
exports.deleteArtistProfileImages = deleteArtistProfileImages;
exports.deleteUserProfileImages = deleteUserProfileImages;