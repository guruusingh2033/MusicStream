const { check, validationResult } = require('express-validator');

// verifying token, if token is valid perform next() else return invalid token
module.exports = (req, res, next) => {
    try {
            check('email').not().isEmpty(),
            check('email').isEmail()
            
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.mapped());
            console.log("errors")
            return res.render('auth/register', { errors: errors.mapped() })
        } else {
            next();
        }


    } catch (err) {
        console.log("Error while verify token:: ", err);
        return res.status(401).json({ message: "Invalid token" });
    }

}