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

const getWhishList = (req, res) => {
    const userId = req.body.userId;
    // const mediaId = req.body.mediaId;
    db.query("CAll sp_WishListGet(?)", [userId], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Fail to get records, Internal server error", err: err })
        if (rows[0].length == 0)
            return res.status(200).json([{ success: 'No record found' }]);
        rows[0][0].success = 'Successfully get all records';
        return res.status(200).json(rows[0]);
    })
}

exports.getWhishList = getWhishList;
exports.insert = insert;