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
                let response = sendEmailToAdmin(rows[1][0]); // await
                let response2 = sendEmailToArtist(rows[1][0]);
                res.emailMsg = response;
                res.status(200).json([{ success: "Successfully approved artist", emailMsg: res.emailMsg }]);
            }        
            else
                res.status(200).json([{ success: "Artist not approved" }]);
        } else
            res.status(200).json([{ success: "Fail to approve artist, Something went wrong", error: err }])
    })
}

var sendEmailToAdmin = (data) => { // async
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

    // let messageBody = '<p>Hello Admin,</p>' 
    //     + '<p> Following artist has been approved.</p>'
    //     + '<img src="' + emailConfig.baseUrl + 'shyamlogo.png"></img>'
    //     + '<h2 style="margin-bottom: -6px;">Artist details </h2>'
    //     + 'Name: ' + data.UserName
    //     + '<br>Password: ' + cryptr.decrypt(data.Password)
    //     + '<br>Email: ' + data.Email
    //     + '<br>Phone No: ' + data.MobileNo;

    let messageBody = '<table style="font-family:open sans,sans-serif;width:100%;border-collapse:collapse;"><tr><td style="font-weight: 500;font-size:20px">Hello Admin,</td></tr>'
        + '<tr><td style="margin-bottom:10px;font-weight: 400;font-size:16px"><span style="display: block;margin:5px 0 15px 0">Following artist has been approved.</span></td></tr></table>'
        + '<table style="border-collapse:collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;">'
        + '<tr><th colspan="2" style="background:#f3f3f3;border: 1px solid #ccc;padding: 10px;"> <img style="width:270px" src="' + emailConfig.baseUrl + 'shyamlogo.png"></th></tr>'
        + '<tr><th colspan="2" style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">Artist details </h2></th></tr>'
        + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px">Name:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.Name + '</td></tr>'
        + '<tr><td style="border: 1px solid #ccc; padding:10px">Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.Email + '</td></tr>'
        + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data.MobileNo + '</td></tr>'
        + '<tr><td style="border: 1px solid #ccc; padding:10px">Password: </td><td style="border: 1px solid #ccc; padding:10px">' + cryptr.decrypt(data.Password) + '</td></tr>'
        + '<tr><td colspan="2" style="text-align: center;border: 1px solid #ccc; padding:10px"><b style="color:#c97328">Shyam Mobile Palace</b><br><p style="margin: 0;">Shop no. 47, Hisar Road, Bhattu Mandi, </p><p style="margin: 0;">Fatehabad, Haryana 125053<p><p style="margin: 10px 0;"><strong style="color:#c97328">Mobile Number:</strong> +91-9254622222 +91-9017822222</p><p style="margin: 0;"><strong style="color:#c97328">Email:</strong> shyammobilepalace@gmail.com</p></td></tr>'
        + '</table>';

    let mailOptions = {
        from: emailConfig.from, // sender address
        to: emailConfig.to, // list of receivers
        subject: 'Artist Approved', // Subject line
        // text: 'Detail of approval' + messageBody, // plain text body
        html: messageBody// html body
    };

    let response;
    // send mail with defined transport object
    transporter.sendMail(mailOptions).then(result => { // await
        console.log('Email send successfull sent: %s', result);
        response = { EmailSend: true, msg: "Successfully send email " };
    }).catch(err => {
        console.log('Error while sending email : %s', err);
        response = { EmailSend: false, msg: "Fail to send e-mail " + err };
    })
    return response;
}

var sendEmailToArtist = (data) => { // async
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

    // let messageBody = '<p>Hello '+ data.Name +',</p>'
    //     + '<p> Your request as an artist has been approved. Please find your details below.</p>'
    //     + '<img src="' + emailConfig.baseUrl + 'shyamlogo.png"></img>'
    //     + '<h2 style="margin-bottom: -6px;">Details </h2>'
    //     + 'Name: ' + data.UserName
    //     + '<br>Password: ' + cryptr.decrypt(data.Password)
    //     + '<br>Email: ' + data.Email
    //     + '<br>Phone No: ' + data.MobileNo;

    let messageBody = '<table style="font-family:open sans,sans-serif;width:100%;border-collapse:collapse;"><tr><td style="font-weight: 500;font-size:20px">Hello  ' + data.Name +',</td></tr>'
        + '<tr><td style="margin-bottom:10px;font-weight: 400;font-size:16px"><span style="display: block;margin:5px 0 15px 0">Your request as an artist has been approved. Please find your details below.</span></td></tr></table>'
        + '<table style="border-collapse:collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;">'
        + '<tr><th colspan="2" style="background:#f3f3f3;border: 1px solid #ccc;padding: 10px;"> <img style="width:270px" src="' + emailConfig.baseUrl + 'shyamlogo.png"></th></tr>'
        + '<tr><th colspan="2" style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">Artist details </h2></th></tr>'
        + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px">Name:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.Name + '</td></tr>'
        + '<tr><td style="border: 1px solid #ccc; padding:10px">Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data.Email + '</td></tr>'
        + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data.MobileNo + '</td></tr>'
        + '<tr><td style="border: 1px solid #ccc; padding:10px">Password: </td><td style="border: 1px solid #ccc; padding:10px">' + cryptr.decrypt(data.Password) + '</td></tr>'
        + '<tr><td colspan="2" style="text-align: center;border: 1px solid #ccc; padding:10px"><b style="color:#c97328">Shyam Mobile Palace</b><br><p style="margin: 0;">Shop no. 47, Hisar Road, Bhattu Mandi, </p><p style="margin: 0;">Fatehabad, Haryana 125053<p><p style="margin: 10px 0;"><strong style="color:#c97328">Mobile Number:</strong> +91-9254622222 +91-9017822222</p><p style="margin: 0;"><strong style="color:#c97328">Email:</strong> shyammobilepalace@gmail.com</p></td></tr>'
        + '</table>';

    let mailOptions = {
        from: emailConfig.from, // sender address
        to: data.Email, // list of receivers
        subject: 'Welcome to Shyam Parivar', // Subject line
        // text: 'Detail of approval' + messageBody, // plain text body
        html: messageBody// html body
    };

    let response;
    // send mail with defined transport object
    transporter.sendMail(mailOptions).then(result => { // await
        console.log('Email send successfull sent: %s', result);
        response = { EmailSend: true, msg: "Successfully send email " };
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