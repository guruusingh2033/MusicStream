exports.getsignup = (req, res, next)=> {
    res.send({ message: 'Sigunup Success'});
};

exports.getlogin = (req, res, next)=> {
    res.send({ message: 'login Success'});
};

 exports.logout = (req, res, next)=> {
    req.logout();
     res.send({ message: 'logout Success' });
};