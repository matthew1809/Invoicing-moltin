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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log('Invoice app listening on port 3000!');
});

app.postAsync('/orders', async (req, res, next) => {
  const parsedRequestBody = parseBody(req);

  const {customer, meta, id} = parsedRequestBody.data;

  const clonedInvoiceObject = cloneInvoiceObjectAndAddInfo(invoiceTemplate);
  const clonedInvoiceObjectWithInfo = clonedInvoiceObject(customer.name)(meta.display_price.with_tax.currency);

  const clonedEmailOptionsObject = cloneEmailOptionsObjectAndAddInfo(emailHelper.mailOptions);
  const clonedEmailOptionsObjectWithInfo = clonedEmailOptionsObject(customer.email);

  return invoiceHelper.generateInvoiceProcess(Moltin)(id)(clonedInvoiceObjectWithInfo)(clonedEmailOptionsObjectWithInfo);
});

const parseBody = (req) => {
  try {
    return JSON.parse(req.body.resources);
  } catch (e) {
    return e;
  }
};

const cloneEmailOptionsObjectAndAddInfo = mailOptions => recipient => {
  const emailOptionsClone =  Object.assign({}, mailOptions, {
    to: recipient
  });
  Object.freeze(emailOptionsClone);
  return emailOptionsClone;
};

const cloneInvoiceObjectAndAddInfo = invoiceTemplate => name => currency => {
  const invoiceClone = Object.assign({}, invoiceTemplate, {
    to: name,
    currency: currency
  });
  Object.freeze(invoiceClone);
  return invoiceClone;
};
