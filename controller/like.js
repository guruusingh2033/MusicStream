const db = require('./connection');
const liking = require('../model/Liking');

// like-1, dislike-0
const addLikeDislike = (req, res) => {
    const value = liking.modelLike(req);
    db.query("CALL sp_LikingInsert(?, ?, ?, @p_return);", [value.userId, value.mediaId, value.like], (err, rows) => {
        if(err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })

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

exports.addLikeDislike = addLikeDislike;