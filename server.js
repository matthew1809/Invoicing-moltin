const moltin = require('@moltin/sdk');
const express = require('express');
const { decorateApp } = require('@awaitjs/express');
const bodyParser = require('body-parser');
const s3Functions = require('./uploadUtils/upload');
const invoiceHelper = require('./invoiceUtils/invoiceHelper');
const emailHelper = require('./emailUtils/emailHelper');
const invoiceTemplate = require('./invoiceUtils/invoiceTemplate').invoice;
const {parseBody} = require('./parseJson');
require('dotenv').load();

const Moltin = moltin.gateway({
  client_id: process.env.moltin_client_id,
  client_secret: process.env.moltin_client_secret,
});

const app = decorateApp(express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000);

app.postAsync('/orders', async (req) => {
  const parsedRequestBody = parseBody(req)(req.body.resources);
  const { customer, meta, id } = parsedRequestBody.data;
  const clonedInvoiceObjectWithInfo = cloneInvoiceObjectAndAddInfo(customer.name)(meta.display_price.with_tax.currency);
  const clonedEmailOptionsObject = cloneEmailOptionsObjectAndAddInfo(emailHelper.mailOptions);
  const clonedEmailOptionsObjectWithInfo = clonedEmailOptionsObject(customer.email);

  return invoiceHelper.generateInvoiceProcess(Moltin)(id)(clonedInvoiceObjectWithInfo)(clonedEmailOptionsObjectWithInfo);
});

const cloneEmailOptionsObjectAndAddInfo = mailOptions => (recipient) => {
  const emailOptionsClone = Object.assign({}, mailOptions, {
    to: recipient,
  });

  return Object.freeze(emailOptionsClone);
};

const cloneInvoiceObjectAndAddInfo = name => (currency) => {
  const invoiceClone = Object.assign({}, invoiceTemplate, {
    to: name,
    currency,
  });
  return Object.freeze(invoiceClone);
};
