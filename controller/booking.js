const db = require('./connection');
const booking = require('../model/booking');
const emailConfig = require('../config/email');
var nodemailer = require("nodemailer");

// insert Booking
const insertBooking = (req, res) => {
    const value = booking.modelBooking(req);
    db.query("CALL sp_BookingInsert(?, ?, ?, ?, ?, @p_return);", [value.artistId, value.place, value.description, value.date, value.time], (err, rows) => {
        if (err)
            return res.status(200).json({ succes: "Internal Server error ", err: err })
        if (rows[0][0].p_return > 0) {
            return res.status(200).json([{ success: 'Inserted' }]);
        }
        if (rows[0][0].p_return == -1)
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
            let response = { EmailSend: true, msg: "Successfully send email " };
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
       
        eventDetails: '<h2 style="margin-bottom: -6px;">Event details </h2>'
            + 'Artist Name: ' + data[2][0].Name //? data[2][0].Name:''
            + '<br>Artist Email: ' + data[2][0].Email //? data[2][0].Email : ''
            + '<br>Artist Phone No: ' + data[2][0].MobileNo //? data[2][0].MobileNo : ''
            + '<br>Place: ' + data[4][0].Place //? data[4][0].Place : ''
            + '<br>Date: ' + data[4][0].Date1 //? data[4][0].Date : ''
            + '<br>Time: ' + data[4][0].Time, //? data[4][0].Time : '',
        userDetails: '<h2 style="margin-bottom: -6px;">User details </h2>'
            + 'Name: ' + param.name //? param.name : ''
                + '<br>Email: ' + param.email //? param.email : ''
                    + '<br>Phone No: ' + data[0][0].MobileNo, //? data[0][0].MobileNo : ''        
        text: '<br><br><label><b>Booking request details:</b></label> ' + param.description //? param.description : '',
       
    }
}

exports.insertBooking = insertBooking;
exports.fetchBooking = fetchBooking;
exports.fetchAllBooking = fetchAllBooking;
exports.deleteBooking = deleteBooking;
exports.editBooking = editBooking;
exports.bookNowEvent = bookNowEvent;