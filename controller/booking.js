const db = require('./connection');
const booking = require('../model/booking');
const emailConfig = require('../config/email');
var nodemailer = require("nodemailer");

// insert Booking
const insertBooking = (req, res) => {
    const value = booking.modelBooking(req);
    db.query("CALL sp_BookingInsert(?, ?, ?, ?, ?, @p_return);  CALL sp_BookingInsertReturnValue", [value.artistId, value.place, value.description, value.date, value.time], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        if (rows[2][0].p_return > 0)
            return res.status(200).json([{ success: 'Inserted' }]);
        if (rows[2][0].p_return == -1)
            return res.status(200).json([{ success: 'Artist does not exists' }]);

        return res.status(200).json([{ success: 'Not inserted' }]);
    })
}

// get booking detail
const fetchBooking = (req, res)=> {
    const value = booking.modelBooking(req);
    db.query("CALL sp_BookingFetch(?);", [value.artistId], (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {            
            rows[0][0].success = "Successfully fetched records";
            return res.status(200).json(rows[0]);
        }
        return res.status(200).json([{ tblMyBookings_ID: 'No record found' }]);
    })
}

// get booking detail and artist detail
const fetchAllBooking = (req, res) => {
    db.query("CALL sp_BookingFetchAll();", [], (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = "Successfully fetched records";
            return res.status(200).json(rows[0]);
        }
        return res.status(200).json([{ tblMyBookings_ID: 'No record found' }]);
    })
}

// remove booking by artist
const deleteBooking = (req, res)=> {
    const bookingId = parseInt(req.body.bookingId);
    const artistId = parseInt(req.body.artistId);
    db.query("CALL sp_BookingRemove(?,?);", [bookingId, artistId], (err, rows) => {
        if (err)
            return res.status(200).json([{ success: 'Internal server error ', error: err }])
        else if (rows.affectedRows != 0)
            return res.status(200).json([{ success: 'Booking removed' }])
        else
            return res.status(200).json([{ success: 'Booking not removed' }])
    })
}

const editBooking = (req,res)=>{
    const value = booking.modelBooking(req);
    db.query("CALL sp_BookingEdit(?, ?, ?, ?, ?, ?)", [value.bookingId, value.artistId, value.place, value.description, value.date, value.time], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        if (rows.affectedRows > 0) {
            return res.status(200).json([{ success: 'Successfully updated' }]);
        }
        return res.status(200).json([{ success: 'Not updated' }]);
    })
}

const bookNowEvent = (req, res) => {
    db.query("CALL sp_retriveUserWithID(?); CALL sp_retriveUserWithID(?); CALL sp_BookEventById(?); ", 
        [req.body.userId, req.body.artistId, req.body.eventId], 
        (err, rows) => { // async
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = "Successfully fetched records";
            // value.artistEmail = rows[0][0].Email;
            // value.artistPhoneno = rows[0][0].MobileNo;
            let data = { name: req.body.name, email:req.body.email, description: req.body.description};
            let reponse1 = sendEmail(rows, data) // await
            let response = [{ EmailSend: true, msg: "Successfully send email " }];
            return res.status(200).json(response);
        }
        return res.status(200).json([{ tblMyBookings_ID: 'No record found' }]);
    })
}

var sendEmail = (data, param) => {  // async
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

    let mailHtmlStore = mailHtml(data, param)

    let mailOptions = {
        from: emailConfig.from, // sender address
        to: emailConfig.to, // list of receivers
        subject: 'A particular user has requested of  event', // Subject line
        // text: mailHtmlStore.header + mailHtmlStore.eventDetails 
        //     + mailHtmlStore.userDetails + mailHtmlStore.artistDetails, // plain text body // + mailHtmlStore
        html: mailHtmlStore.eventDetails + mailHtmlStore.userDetails + mailHtmlStore.text // html body
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

const mailHtml = (data,param)=>{ 
    return {       
        // eventDetails: '<img src="../logo/shyamlogo.png">'
        //     + '<h2 style="margin-bottom: -6px;">Event details </h2>'
        //     + 'Artist Name: ' + data[2][0].Name //? data[2][0].Name:''
        //     + '<br>Artist Email: ' + data[2][0].Email //? data[2][0].Email : ''
        //     + '<br>Artist Phone No: ' + data[2][0].MobileNo //? data[2][0].MobileNo : ''
        //     + '<br>Place: ' + data[4][0].Place //? data[4][0].Place : ''
        //     + '<br>Date: ' + data[4][0].Date1 //? data[4][0].Date : ''
        //     + '<br>Time: ' + data[4][0].Time, //? data[4][0].Time : '',
        // userDetails: '<h2 style="margin-bottom: -6px;">User details </h2>'
        //     + 'Name: ' + param.name //? param.name : ''
        //     + '<br>Email: ' + param.email //? param.email : ''
        //     + '<br>Phone No: ' + data[0][0].MobileNo, //? data[0][0].MobileNo : ''        
        text: '<br><br><label><b>Booking request details:</b></label> ' + param.description,//? param.description : '',
       
         eventDetails : '<table style="border-collapse: collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;"><tr><th colspan="2" style="background:#f3f3f3;border: 1px solid #ccc;padding: 10px;"> <img style="width:130px" src="' + emailConfig.baseUrl + '/wp-content/uploads/2019/10/logo.png"></th></tr>'
         + '<tr><th colspan="2"  style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">Event details</h2></th></tr>'
         + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px">Artist Name:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data[2][0].Name + '</td></tr>'
         + '<tr><td style="border: 1px solid #ccc; padding:10px">Artist Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data[2][0].Email + '</td></tr>'
         + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Artist Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data[2][0].MobileNo+ '</td></tr>'
         + '<tr><td style="border: 1px solid #ccc; padding:10px">Place: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Place + '</td></tr>'
         + '<tr><td style="border: 1px solid #ccc; padding:10px">Date: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Date1 + '</td></tr>'
         + '<tr><td style="border: 1px solid #ccc; padding:10px">Time: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Time + '</td></tr>'
        + '<tr><td colspan="2" style="text-align: center;border: 1px solid #ccc; padding:10px"><b style="color:#c97328">Shyam Mobile</b><br><p style="margin: 0;">Shop no. 47, Hisar Road, Bhattu Mandi, </p><p style="margin: 0;">Fatehabad, Haryana 125053<p><p style="margin: 10px 0;"><strong style="color:#c97328">Mobile Number:</strong> +91-9254622222 +91-9017822222</p><p style="margin: 0;"><strong style="color:#c97328">Email:</strong> shyammobilepalace@gmail.com</p></td></tr>'
        + '</table>',

        userDetails: '<table style="border-collapse: collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;">'
            + '<tr><th colspan="2"  style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">User details</h2></th></tr>'
            + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px"> Name:</td><td style="border: 1px solid #ccc; padding:10px"> ' + param.name + '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + param.email + '</td></tr>'
            + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data[0][0].MobileNo + '</td></tr>'
            + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">>Booking request details: </td><td style="border: 1px solid #ccc; padding:10px">' + param.description + '</td></tr>'
            + '</table>'
    }
}

exports.insertBooking = insertBooking;
exports.fetchBooking = fetchBooking;
exports.fetchAllBooking = fetchAllBooking;
exports.deleteBooking = deleteBooking;
exports.editBooking = editBooking;
exports.bookNowEvent = bookNowEvent;