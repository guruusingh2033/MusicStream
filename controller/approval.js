const db = require('./connection');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('MusicStreammyTotalySecretKey');

// retun all approved Artist(UserType 3 and Status 1)
var allApprovedArtist = (req,res)=>{
    db.query('CALL sp_AllApprovedArtitst()', (err, rows)=>{
        if(!err && rows.affectedrows != 0){
            setSuccessWithEachRecord(rows, 'approved' );            
            res.status(200).json(rows[0]);
        }else
            res.status(200).json([{ success: "Fail to retirve All Approved Artist", error: err}])
    })
}

// return all pending artist(UserType 3 and Status 2) for approval
var allPendingArtist = (req, res)=>{
    db.query("CALL sp_AllPendingArtist()", (err, rows)=>{
        if (!err && rows[0].length != 0){
            setSuccessWithEachRecord(rows, 'pending');
            res.status(200).json(rows[0]);
        }else if (!err && rows[1].affectedRows == 0) {
            res.status(200).json([{ success: "No artist pending for approval"}]);
        }else
            res.status(200).json([{ success: "Fail to retirve All Pending Artist for approval", error: err }])
    })
}

// Add success element in each row with message
function setSuccessWithEachRecord(rows, checkApi){
    if (checkApi == 'approved'){
        for (let i = 0; i < rows[0].length; i++) {
            rows[0][i].success = "Successfully retirve ALL Approved Artist";
        } 
    }else{
        for (let i = 0; i < rows[0].length; i++) {
            rows[0][i].success = "Successfully retirve All Pending Artist for approval";
        } 
    }     
}

// approved artist(insert user password) if status 2 else send not approved 
var approveToArtist = (req,res)=>{
    const id = req.body.artistId;
    let param = setValues(req);
    // db.query("CALL sp_CountPendingArtist", (err, rows)=>{
    //     if (err) 
    //         res.status(200).json([{ success: "Something went wrong", error:err }]);
    //     // if pending artist 0 then return message else approved to artist 
    //     if (rows[0].length != 0 && rows[0][0].pendingArtist == 0){
    //         res.status(200).json([{ success: "There is no pending artist" }]);
    //     }else{
            db.query("CALL sp_ApproveToArtist(?,?,?, @ret_value); CALL sp_ApproveToArtistReturnValue;", [id, param.userName, param.password], (err, rows) => {
                if (err && err.code === 'ER_DUP_ENTRY')
                    return res.status(200).json([{ success: 'An account with this userName already exists.' }])
                if (!err && rows[0].affectedrows != 0) {
                    if (rows[1][0].ret_value == 0)
                        res.status(200).json([{ success: "There is no pending artist" }]);
                    else  if (rows[1][0].ret_value == 2)
                        res.status(200).json([{ success: "Successfully approved artist" }]);                    
                    else
                        res.status(200).json([{ success: "Artist not approved " }]);
                } else
                    res.status(200).json([{ success: "Fail to approve artist, Something went wrong", error: err }])
            })
        //}
    // }) 
}

// getting value from request.body and setting in object
var setValues = (req) => {
    let fieldValues = {
        id:req.body.id,
        userName: req.body.userName,
        status: req.body.status      
        // email: req.body.email,
    };
    if (req.body.password)
        fieldValues.password = cryptr.encrypt(req.body.password);
    return (fieldValues);
}

// change status(active (1)/inactive (2)) of user based on id
const changeStatus = (req,res) => {
    const param = setValues(req)
    db.query("CALL sp_ChangeStatus(?,?)", [param.id, param.status], (err, rows) => {
        if(err)
            return res.status(200).json([{ success: 'Internal server error.', err:err }])
        else if (rows.affectedRows != 0)
            return res.status(200).json([{ success: 'Successfully changed status', status: param.status }])

        return res.status(200).json([{ success: 'Fail to change status, Id should be valid' }])

    })
}


exports.allApprovedArtist = allApprovedArtist;
exports.allPendingArtist = allPendingArtist;
exports.approveToArtist = approveToArtist
exports.changeStatus = changeStatus;