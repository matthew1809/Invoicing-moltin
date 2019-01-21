const express = require('express');
const { decorateApp } = require('@awaitjs/express');
const bodyParser = require('body-parser');
const s3Functions = require('./upload');
const invoiceHelper = require('./invoiceUtils/invoiceHelper');
const invoiceTemplate = require('./invoiceUtils/invoiceTemplate');
const emailHelper = require('./emailUtils/emailHelper');

require('dotenv').load();

const app = decorateApp(express());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/test', (req, res) => {
  res.send('app functioning successfully');
});

app.listen(3000, () => {
  console.log('Invoice app listening on port 3000!');
});


app.postAsync('/orders', async (req, res, next) => {
  const parsedRequestBody = await parseBody(req);

  const orderId = parsedRequestBody.data.id;

  const clonedInvoiceObject = await cloneInvoiceObjectAndAddInfo(parsedRequestBody.data.customer.name, parsedRequestBody.data.meta.display_price.with_tax.currency);

  const clonedEmailOptionsObject = await cloneEmailOptionsObjectAndAddInfo(parsedRequestBody.data.customer.email);

  return invoiceHelper.generateInvoiceProcess(orderId, clonedInvoiceObject, clonedEmailOptionsObject);
});

const parseBody = async (req) => {
  try {
    return JSON.parse(req.body.resources);
  } catch (e) {
    return e;
  }
};

const cloneEmailOptionsObjectAndAddInfo = async (recipient) => {
  const emailOptionsClone = await Object.assign({}, emailHelper.mailOptions);
  emailOptionsClone.to = recipient;
  return emailOptionsClone;
};

const cloneInvoiceObjectAndAddInfo = async (name, currency) => {
  const invoiceClone = await Object.assign({}, invoiceTemplate.invoice);

  invoiceClone.to = name;
  invoiceClone.currency = currency;

  return invoiceClone;
};
