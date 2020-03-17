const db = require('./connection');
const liking = require('../model/Liking');

// like-1, dislike-0
const addLikeDislike = (req, res) => {
    const value = liking.modelLike(req);
    db.query("CALL sp_LikingInsert(?, ?, ?, @p_return);", [value.userId, value.mediaId, value.like], (err, rows) => {
        if(err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        // if rows[0][0].p_return == 3 successfuly updated value 
        if (rows[0][0].p_return > 0){
            return res.status(200).json([{ success: 'Yes' }]);
        }
        if (rows[0][0].p_return == -1)
            return res.status(200).json([{ success: 'User does not exists' }]);
        if (rows[0][0].p_return == -2)
            return res.status(200).json([{ success: 'Media does not exists' }]);

        return res.status(200).json([{ success: 'No' }]);
    })
}

const fetchLikeDislike = (req, res) => {
    const value = liking.modelLike(req);
    db.query("CALL sp_LikesFetch(?, ?);", [value.userId, value.mediaId], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            return res.status(200).json([{ success: rows[0][0].Liking }]);
        }
        return res.status(200).json([{ success: 'No record found' }]);
    })
}

const artistListLikeByUser = (req,res)=> {
    const value = liking.modelLike(req);
    db.query("CALL sp_ArtistListLikesByUser(?);", [value.userId], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = 'Successfully get records';
            return res.status(200).json(rows[0]);
        }
        return res.status(200).json([{ success: 'No record found' }]);
    })
}

exports.addLikeDislike = addLikeDislike;
exports.fetchLikeDislike = fetchLikeDislike;
exports.artistListLikeByUser = artistListLikeByUser;