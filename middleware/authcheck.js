const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = (req,res,next)=>{
    try{
        let token = req.headers.authorization;
        if (token) token = token.split(" ")[1];

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decode;
        next();

    }catch(err){
        console.log("Error while verify token:: " , err);
        return res.status(401).json({message:"Invalid token"});
    }

}