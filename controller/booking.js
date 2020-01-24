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
    const value = booking.modelBooking(req);
    db.query("CALL sp_ArtistGetById(?);", [value.artistId], 
    async (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = "Successfully fetched records";
            value.artistEmail = rows[0][0].Email;
            value.artistPhoneno = rows[0][0].MobileNo;
            let reponse = await sendEmail(value)
            return res.status(200).json(reponse);
        }
        return res.status(200).json([{ tblMyBookings_ID: 'No record found' }]);
    })
}

var sendEmail = async (data) => { 
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

    let mailHtmlStore = mailHtml(data)

    let mailOptions = {
        from: emailConfig.from, // sender address
        to: emailConfig.to, // list of receivers
        subject: 'A particular user has requested of  event', // Subject line
        // text: mailHtmlStore.header + mailHtmlStore.eventDetails 
        //     + mailHtmlStore.userDetails + mailHtmlStore.artistDetails, // plain text body // + mailHtmlStore
        html: mailHtmlStore.header + mailHtmlStore.eventDetails 
            + mailHtmlStore.userDetails + mailHtmlStore.artistDetails// html body
    };

    let response;
    // send mail with defined transport object
    await transporter.sendMail(mailOptions).then(result => { 
        console.log('Email send successfull sent: %s', result);
        response = { EmailSend: true, msg: "Successfully send email " };
    }).catch(err => {
        console.log('Error while sending email : %s', err);
        response = { EmailSend: false, msg: "Fail to send e-mail " + err };
    })
    return response;
}

const mailHtml = (data)=>{ 
    return {
         header:'<h1>Booking query </h1>',
        eventDetails: '<h2 style="margin-bottom: -6px;">Event details </h2>'
        + 'Place: ' + data.artistplace
        + '<br>Date: ' + data.date
        + '<br>Time: ' + data.time
        + '<br>Details: ' + data.description,
        userDetails: '<h2 style="margin-bottom: -6px;">User details </h2>'
        + 'Name: ' + data.name
        + '<br>Email: ' + data.email
        + '<br>Phone No.: ' + data.phoneNo
        + '<br>Details: ' + data.describe,
        artistDetails: '<h2 style="margin-bottom: -6px;">Artist details </h2>'
        + 'Name: ' + data.artistName
        + '<br>Email: ' + data.artistEmail
        + '<br>Phone No.: ' + data.artistPhoneno
    }
}

exports.insertBooking = insertBooking;
exports.fetchBooking = fetchBooking;
exports.fetchAllBooking = fetchAllBooking;
exports.deleteBooking = deleteBooking;
exports.editBooking = editBooking;
exports.bookNowEvent = bookNowEvent;