module.exports = {
    host: 'mail.shyammobile.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    debug: true,
    auth: {
        user: 'info@shyammobile.com', //process.env.GMAIL_USER, // generated ethereal user
        pass: 'Yash.gaurav1' //process.env.GMAIL_PASSWORD // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    },
    from: '<info@shyammobile.com>', // sender address
    to: 'shyamparivar@shyammobile.com',
    baseUrl:'http://185.149.112.29:3000/'
};
