const db = require('./connection');
const booking = require('../model/booking');
const emailConfig = require('../config/email');
// var nodemailer = require("nodemailer");
const emailService = require('../service/emailService');

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
            let reponse1 = sendEmailBooking(rows, data) // await
            let response = [{ EmailSend: true, msg: "Successfully send email " }];
            return res.status(200).json(response);
        }
        return res.status(200).json([{ tblMyBookings_ID: 'No record found' }]);
    })
}

var sendEmailBooking = (data, param) => {  // async
    let mailHtmlStore = mailHtml(data, param)
    let messageBody = mailHtmlStore.eventDetails + mailHtmlStore.userDetails;
    const subject = 'A particular user has requested of  event';
    const mailTo = emailConfig.to;
    let response = emailService.sendEmail(subject, messageBody, mailTo);
    return response;
}

const mailHtml = (data,param)=>{ 
    return {                
        eventDetails: '<table style="font-family:open sans,sans-serif;width:100%;border-collapse:collapse;"><tr><td style="font-weight: 500;font-size:20px">Hello Admin,</td></tr>'
            + '<tr><td style="margin-bottom:10px;font-weight: 400;font-size:16px"><span style="display: block;margin:5px 0 15px 0">Following detail of booking event</span></td></tr></table>'
            + '<table style="border-collapse: collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;"><tr><th colspan="2" style="background:#f3f3f3;border: 1px solid #ccc;padding: 10px;"> <img style="width:130px" src="' + emailConfig.baseUrl + 'shyamlogo.png"></th></tr>'
            + '<tr><th colspan="2"  style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">Event details</h2></th></tr>'
            + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px;width:50%;">Artist Name:</td><td style="border: 1px solid #ccc; padding:10px;width:50%;"> ' + data[2][0].Name + '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Artist Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + data[2][0].Email + '</td></tr>'
            + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Artist Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data[2][0].MobileNo+ '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Place: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Place + '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Date: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Date1 + '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Time: </td><td style="border: 1px solid #ccc; padding:10px">' + data[4][0].Time + '</td></tr>'
            + '</table>',
        userDetails: '<table style="border-collapse: collapse;max-width: 600px;margin: 0 auto;width:100%;font-family:open sans,sans-serif;">'
            + '<tr><th colspan="2"  style="border: 1px solid #ccc; padding:10px"><h2 style="margin:0; font-size: 18px;color:#4a4a4a">User details</h2></th></tr>'
            + '<tr style="background:#f3f3f3"> <td style="border: 1px solid #ccc; padding:10px;width:50%;"> Name:</td><td style="border: 1px solid #ccc; padding:10px;width:50%;"> ' + param.name + '</td></tr>'
            + '<tr><td style="border: 1px solid #ccc; padding:10px">Email:</td><td style="border: 1px solid #ccc; padding:10px"> ' + param.email + '</td></tr>'
            + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Phone No: </td><td style="border: 1px solid #ccc; padding:10px">' + data[0][0].MobileNo + '</td></tr>'
            + '<tr style="background:#f3f3f3"><td style="border: 1px solid #ccc; padding:10px">Booking request details: </td><td style="border: 1px solid #ccc; padding:10px">' + param.description + '</td></tr>'
            + '<tr><td colspan="2" style="text-align: center;border: 1px solid #ccc; padding:10px"><b style="color:#c97328">Shyam Mobile</b><br><p style="margin: 0;">Shop no. 47, Hisar Road, Bhattu Mandi, </p><p style="margin: 0;">Fatehabad, Haryana 125053<p><p style="margin: 10px 0;"><strong style="color:#c97328">Mobile Number:</strong> +91-9254622222 +91-9017822222</p><p style="margin: 0;"><strong style="color:#c97328">Email:</strong> shyamparivar@shyammobile.com</p></td></tr>'
           + '</table>'
    }
}

exports.insertBooking = insertBooking;
exports.fetchBooking = fetchBooking;
exports.fetchAllBooking = fetchAllBooking;
exports.deleteBooking = deleteBooking;
exports.editBooking = editBooking;
exports.bookNowEvent = bookNowEvent;