const db = require('./connection');
const booking = require('../model/booking');

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
        return res.status(200).json([{ success: 'No record found' }]);
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
        return res.status(200).json([{ success: 'No record found' }]);
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

exports.insertBooking = insertBooking;
exports.fetchBooking = fetchBooking;
exports.fetchAllBooking = fetchAllBooking;
exports.deleteBooking = deleteBooking;
exports.editBooking = editBooking;