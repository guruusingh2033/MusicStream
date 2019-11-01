const db = require('./connection');

// retun approved Artist(UserType 3 and Status 1)
var approvedArtist = (req,res)=>{
    db.query('CALL sp_ApprovedArtitst', (err, rows)=>{
        if(!err && rows.affectedrows != 0){
            rows[0].success = "Successfully retirve Approved Artist";
            res.status(200).json(rows[0]);
        }else
            res.status(200).json([{success:"Fail to retirve Approved Artist"}])
    })
}

exports.approvedArtist = approvedArtist;