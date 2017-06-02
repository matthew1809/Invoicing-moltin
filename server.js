var express    = require('express')
var https      = require("https");
var fs         = require("fs");
var bodyParser = require('body-parser');
var config     = require('./config.js');
const nodemailer = require('nodemailer');
const moltin = require('@moltin/sdk');
const Moltin = moltin.gateway({
  client_id: config.client_id,
  client_secret: config.client_secret,
});

var app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function generateInvoice(invoice, filename, success, error) {
    var postData = JSON.stringify(invoice);
    var options = {
        hostname  : "invoice-generator.com",
        port      : 443,
        path      : "/",
        method    : "POST",
        headers   : {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        }
    };

    var file = fs.createWriteStream(filename);

    var req = https.request(options, function(res) {
        res.on('data', function(chunk) {
            file.write(chunk);
        })
        .on('end', function() {
            file.end();

            if (typeof success === 'function') {
                success();
            }
        });
    });
    req.write(postData);
    req.end();

    if (typeof error === 'function') {
        req.on('error', error);
    }
}

let transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.user,
        pass: config.pass
    }
});

let mailOptions = {
    from: '"Moltin Store 👻" <invoicingmoltin@gmail.com>', // sender address
    to: 'matt@moltin.com', // list of receivers
    subject: 'Your Invoice ✔', // Subject line
    text: 'Please find your invoice attached', // plain text body
    html: '<b>Your Invoice</b>', // html body
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

var order_items = {
    name: "",
    quantity: 0,
    unit_cost: 0
};

var order_id = ''

var get_order_items = function(order_id) {
  console.log(order_id)

  Moltin.Orders.Items(order_id)
    .then((items) => {
      var data = items.data
      data.forEach((item) => {
        invoice.items.push({
              name: item.name,
              quantity: item.quantity,
              unit_cost: item.unit_price.amount
          });
      })
    })
    .then(() => {
      var to = invoice.to + '.pdf';
      generateInvoice(invoice, to, function() {
          console.log("Saved invoice to " + to);
          mailOptions.attachments[0].filename = to;
          mailOptions.attachments[0].path = './' + to;
          console.log(mailOptions);
          return sendMail();
      }, function(error) {
          console.error(error);
      });
    })

    .catch((error) => {
      // 4xx, 5xx response
      console.log(error);
    });
}

app.post('/', function (req, res) {
  pbody = JSON.parse(req.body.resources);
    order_id = pbody.data.id;
    console.log('the parsed order id is: ' + order_id);
    invoice.to = pbody.data.customer.name;
    invoice.currency = pbody.data.meta.display_price.with_tax.currency;
  return get_order_items(order_id);

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
