const jwt = require('jsonwebtoken');
require('dotenv/config');

// verifying token, if token is valid perform next() else return invalid token
module.exports = (req,res,next)=>{
    try{
        let token = req.headers.authorization; // getting token from header
        if (token) token = token.split(" ")[1]; // removing bearer

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY); // verifying token and returning user
        req.user = decode;
        next();

    }catch(err){
        console.log("Error while verify token:: " , err);
        return res.status(401).json({message:"Invalid token"});
    }

}