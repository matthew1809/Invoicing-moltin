var express      = require('express')
var https        = require("https");
var fs           = require("fs");
var bodyParser   = require('body-parser');
var s3Functions  = require('./upload.js');
var invoice      = require('./invoice.js');
const nodemailer = require('nodemailer');
const moltin     = require('@moltin/sdk');
const Moltin     = moltin.gateway({
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded 

let transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }
});

let mailOptions = {
    from: '"new Store 👻" <invoicingmoltin@gmail.com>', // sender address
    to: 'matt@moltin.com', // list of receivers
    subject: 'Your newstore Invoice ✔', // Subject line
    text: 'Please find your newstore invoice attached', // plain text body
    html: '<b>Your newstore Invoice</b>', // html body
    attachments: [{   // file on disk as an attachment
      filename: 'invoice.pdf',
      path: './invoice.pdf' // stream this file
    }]
};

var sendMail = () => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    // uncomment the following line if you want your file uploaded to s3
    //s3Functions.baseFile('mailOptions.attachments[0].filename');
  });
};

var invoice = {
    logo: "http://invoiced.com/img/logo-invoice.png",
    from: "My Moltin Store",
    to: "Johnny Appleseed",
    currency: "usd",
    number: "INV-0001",
    payment_terms: "Auto-Billed - Do Not Pay",
    items: [],
    notes: "Thanks for being an awesome customer!",
    terms: "No need to submit payment. You will be auto-billed for this invoice."
};

var order_id = '';

var get_order_items = function(order_id) {
  Moltin.Orders.Items(order_id)
    .then((items) => {
      var data = items.data
      data.forEach((item) => {
        invoice.items.push({
            name: item.name,
            quantity: item.quantity,
            unit_cost: item.unit_price.amount
          });
      });
    })
    .then(() => {
      var to = invoice.to + '.pdf';
      invoice.generateInvoice(invoice, to, function() {
          console.log("Saved invoice to " + to);
          mailOptions.attachments[0].filename = to;
          mailOptions.attachments[0].path = './' + to;
          return sendMail();
      }, function(error) {
          console.error(error);
      });
    })

    .catch((error) => {
      console.log(error);
    });
};

app.post('/orders', function (req, res) {
  pbody = JSON.parse(req.body.resources);
  order_id = pbody.data.id;
  console.log('the parsed order id is: ' + order_id);
  mailOptions.to = pbody.data.customer.email;
  invoice.to = pbody.data.customer.name;
  invoice.currency = pbody.data.meta.display_price.with_tax.currency;
  return get_order_items(order_id);
});

app.get('/test', function (req, res) {
  res.send('app functioning successfully');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
