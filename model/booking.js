const modelBooking = (req) => {
    return {
        // user detail
        bookingId: req.body.bookingId,       
        place: req.body.place,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time,
        name: req.body.name, 
        email: req.body.email,
        userId: req.body.userId,
        phoneNo: req.body.phoneNo,
        //  artist detail
        artistId: req.body.artistId,
        artistplace: req.body.artistplace,
        describe: req.body.describe, 
        artistName: req.body.artistName
    }
}

exports.modelBooking = modelBooking;
