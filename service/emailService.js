var nodemailer = require("nodemailer");
var emailConfig = require('../config/email')

const sendEmail = (subject, messageBody, mailTo) =>{
    // create reusable transporter object using the default SMTP transport 
    const mailOptions = {
        from: emailConfig.from, // sender address
        to: mailTo, // list of receivers
        subject: subject, // Subject line
        html: messageBody// html body
    };

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

    let response;
    // send mail with defined transport object
    transporter.sendMail(mailOptions).then(result => { // await
        console.log('Email send successfull sent: %s', result);
        response = { EmailSend: true, msg: "Successfully send email " };
    }).catch(err => {
        console.log('Error while sending email : %s', err);
        response = { EmailSend: false, msg: "Fail to send e-mail " + err };
    })
    return response;
}

exports.sendEmail = sendEmail;
