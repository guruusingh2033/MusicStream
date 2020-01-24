const db = require('./connection');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('MusicStreammyTotalySecretKey');
var nodemailer = require("nodemailer");
var emailConfig = require('../config/email')

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
    db.query("CALL sp_ApproveToArtist(?,?,?, @ret_value); CALL sp_ApproveToArtistReturnValue(?);", 
        [id, param.userName, param.password, id], 
        (err, rows) => {//async            
        if (err && err.code === 'ER_DUP_ENTRY')
            return res.status(200).json([{ success: 'May userName/email/phone no. already exists.' }])
        if (!err && rows[0].affectedRows != 0) {
            if (rows[1][0].ret_value == 0)
                res.status(200).json([{ success: "There is no pending artist" }]);
            else if (rows[1][0].ret_value == 1) {
                res.status(200).json([{ success: "Artist already approved" }]);
            }   
            else if (rows[1][0].Status == 1 || rows[1][0].ret_value == 2){
                let response = sendEmail(rows[1][0]); // await
                res.emailMsg = response;
                res.status(200).json([{ success: "Successfully approved artist", emailMsg: res.emailMsg }]);
            }        
            else
                res.status(200).json([{ success: "Artist not approved" }]);
        } else
            res.status(200).json([{ success: "Fail to approve artist, Something went wrong", error: err }])
    })
}

var sendEmail = (data) => { // async
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure, // true for 465, false for other ports
        debug: emailConfig.debug,
        auth: {
            user: emailConfig.auth.user, //process.env.GMAIL_USER, // generated ethereal user
            pass: emailConfig.auth.pass //process.env.GMAIL_PASSWORD // generated ethereal password
        },
        tls: {
            rejectUnauthorized: emailConfig.tls.rejectUnauthorized
        }
    });

    let messageBody = '<h2 style="margin-bottom: -6px;">Here is details </h2>'
        + 'Name: ' + data.UserName
        + '<br>Password: ' + cryptr.decrypt(data.Password)
        + '<br>Email: ' + data.Email
        + '<br>Phone No.: ' + data.MobileNo;

    let mailOptions = {
        from: emailConfig.from, // sender address
        to: emailConfig.to + ', ' + data.Email, // list of receivers
        subject: 'Approval email  ?', // Subject line
        text: 'Detail of approval' + messageBody, // plain text body
        html: messageBody// html body
    };

    let response;
    // send mail with defined transport object
    transporter.sendMail(mailOptions).then(result => { // await
        console.log('Email send successfull sent: %s', result);
        response = { EmailSend: true, msg: "Successfully send email " };
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }).catch(err => {
        console.log('Error while sending email : %s', err);
        response = { EmailSend: false, msg: "Fail to send e-mail " + err };
    })
    return response;
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