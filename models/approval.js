const db = require('./connection');

// retun all approved Artist(UserType 3 and Status 1)
var allApprovedArtist = (req,res)=>{
    db.query('CALL sp_AllApprovedArtitst', (err, rows)=>{
        if(!err && rows.affectedrows != 0){
            rows[0][0].success = "Successfully retirve ALL Approved Artist";
            res.status(200).json(rows[0]);
        }else
            res.status(200).json([{success:"Fail to retirve All Approved Artist"}])
    })
}

// return all pending artist(UserType 3 and Status 2) for approval
var allPendingArtist = (req, res)=>{
    db.query("CALL sp_AllPendingArtist", (err, rows)=>{
        if(!err){
            rows[0][0].success = "Successfully retirve All Pending Artist for approval";
            res.status(200).json(rows[0]);
        }else
            res.status(200).json([{ success: "Fail to retirve All Pending Artist for approval" }])
    })
}

exports.allApprovedArtist = allApprovedArtist;
exports.allPendingArtist = allPendingArtist;