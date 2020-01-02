const modelBooking = (req) => {
    return {
        bookingId: req.body.bookingId,
        artistId: req.body.artistId,
        place: req.body.place,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time
    }
}

exports.modelBooking = modelBooking;
