const moltin = require('@moltin/sdk');
const express = require('express');
const { decorateApp } = require('@awaitjs/express');
const bodyParser = require('body-parser');
const s3Functions = require('./uploadUtils/upload');
const invoiceHelper = require('./invoiceUtils/invoiceHelper');
const invoiceTemplate = require('./invoiceUtils/invoiceTemplate').invoice;
const emailHelper = require('./emailUtils/emailHelper');

require('dotenv').load();

const Moltin = moltin.gateway({
  client_id: process.env.moltin_client_id,
  client_secret: process.env.moltin_client_secret,
});

const app = decorateApp(express());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.listen(3000, () => {
  console.log('Invoice app listening on port 3000!');
});

app.postAsync('/orders', async (req, res, next) => {
  const parsedRequestBody = await parseBody(req);

  const orderId = parsedRequestBody.data.id;
  const {customer, meta} = parsedRequestBody.data;

  const clonedInvoiceObject =  cloneInvoiceObjectAndAddInfo(customer.name)(meta.display_price.with_tax.currency)(invoiceTemplate);

  const clonedEmailOptionsObject = cloneEmailOptionsObjectAndAddInfo(customer.email)(emailHelper.mailOptions);

  return invoiceHelper.generateInvoiceProcess(Moltin)(orderId)(clonedInvoiceObject)(clonedEmailOptionsObject);
});

const parseBody = async (req) => {
  try {
    return JSON.parse(req.body.resources);
  } catch (e) {
    return e;
  }
};

const cloneEmailOptionsObjectAndAddInfo = recipient => mailOptions => {
  const emailOptionsClone =  Object.assign({}, mailOptions, {
    to: recipient
  });
  return emailOptionsClone;
};

const cloneInvoiceObjectAndAddInfo = name => currency => invoiceTemplate => {
  const invoiceClone = Object.assign({}, invoiceTemplate, {
    to: name,
    currency: currency
  });

  return invoiceClone;
};
