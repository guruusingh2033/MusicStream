const db = require('./connection');

const insert = (req, res) => {
    const userId = req.body.userId;
    const mediaId = req.body.mediaId;
    db.query("CAll sp_WishListInsert(?,?)", [userId, mediaId],  (err, rows)=> {
        if(err)
            return res.status(200).json({ succes: "Fail to insert, Internal server error", err:err })
        else if(rows.affectedRows != 0){
            return res.status(200).json([{ success: 'Insertion successfully done' }]);
        }
    })
}

exports.insert = insert;