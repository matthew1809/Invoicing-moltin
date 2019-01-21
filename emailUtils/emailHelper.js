exports = module.exports;

const nodemailer = require('nodemailer');

exports.mailOptions = {
  from: '"new Store 👻" <invoicingmoltin@gmail.com>', // sender address
  to: 'matt@moltin.com', // list of receivers
  subject: 'Your newstore Invoice ✔', // Subject line
  text: 'Please find your newstore invoice attached', // plain text body
  html: '<b>Your newstore Invoice</b>', // html body
  attachments: [{ // file on disk as an attachment
    filename: 'invoice.pdf',
    path: './invoice.pdf', // stream this file
  }],
};

// set up our email transporter
const transporter = nodemailer.createTransport({
  service: process.env.email_service,
  auth: {
    user: process.env.email_user,
    pass: process.env.email_password,
  },
});


exports.sendMail = (emailOptionsObject) => {
  transporter.sendMail(emailOptionsObject, (error, info) => {
    if (error) {
      return error;
    }
    return info;
    // uncomment the following line if you want your files uploaded to S3
    // s3Functions.baseFile(mailOptions.attachments[0].filename);
  });
};
