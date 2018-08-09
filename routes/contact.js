const express = require('express');
const router = express.Router();

const nodeMailer = require('nodemailer');

router.get('/', (req, res) => {
  res.render('contact');
})

router.post('/', (req, res) => {

  const output =
    `
  <p>New Contact Request</p>
  <h3>Contact Details</h3>
  <ul>
    <li>Name: ${req.body.name}</li>
    <li>Email: ${req.body.email}</li>
  </ul>
  <h3>Message</h3>
  <p>${req.body.msg}</p>
  `;

  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'alxdosin@gmail.com',
      pass: 'alexdosin21aazz'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let mailOptions = {
    from: '"Nodemailer" <alxdosin@gmail.com>', // sender address
    to: 'Alxdoutsinis@gmail.com', // list of receivers
    subject: 'Nodemailer Contact Request', // Subject line
    text: 'Hello', // plain text body
    html: output // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.json({ complete: true });
  });

})


module.exports = router;