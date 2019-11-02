const db = require('./connection');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('MusicStreammyTotalySecretKey');

// retun all approved Artist(UserType 3 and Status 1)
var allApprovedArtist = (req,res)=>{
    db.query('CALL sp_AllApprovedArtitst()', (err, rows)=>{
        if(!err && rows.affectedrows != 0){
            rows[0][0].success = "Successfully retirve ALL Approved Artist";
            res.status(200).json(rows[0]);
        }else
            res.status(200).json([{ success: "Fail to retirve All Approved Artist", error: err}])
    })
}

// return all pending artist(UserType 3 and Status 2) for approval
var allPendingArtist = (req, res)=>{
    db.query("CALL sp_AllPendingArtist()", (err, rows)=>{
        if (!err && rows[0].length != 0){
            rows[0][0].success = "Successfully retirve All Pending Artist for approval";
            res.status(200).json(rows[0]);
        }else if (!err && rows[1].affectedRows == 0) {
            res.status(200).json([{ success: "No artist pending for approval"}]);
        }else
            res.status(200).json([{ success: "Fail to retirve All Pending Artist for approval", error: err }])
    })
}

// approved artist(insert user password) if status 2 else send not approved 
var approveToArtist = (req,res)=>{
    const id = req.body.artistId;
    let param = setValues(req);
    db.query("CALL sp_ApproveToArtist(?,?,?, @ret_value); CALL sp_ApproveToArtistReturnValue;", [id, param.userName, param.password], (err, rows)=>{
        if(!err && rows[0].affectedrows != 0){
            if (rows[1][0].ret_value == 2)
                res.status(200).json([{ success:"Successfully approved artist" }]);
            else
                res.status(200).json([{ success: "Not approved artist" }]);
        }else
            res.status(200).json([{ success:"Fail to approve artist, Something went wrong", error:err }])
    })
}

// getting value from request.body and setting in object
var setValues = (req) => {
    let fieldValues = {
        userName: req.body.userName,      
        // email: req.body.email,
    };
    if (req.body.password)
        fieldValues.password = cryptr.encrypt(req.body.password);
    return (fieldValues);
}

exports.allApprovedArtist = allApprovedArtist;
exports.allPendingArtist = allPendingArtist;
exports.approveToArtist = approveToArtist