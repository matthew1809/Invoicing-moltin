exports = module.exports;

const util = require('util');
require('util.promisify').shim();

const moltin = require('@moltin/sdk');
const emailHelper = require('../emailUtils/emailHelper');
const invoiceGenerator = require('./invoiceGenerator');

const Moltin = moltin.gateway({
  client_id: process.env.moltin_client_id,
  client_secret: process.env.moltin_client_secret,
});


exports.generateInvoiceProcess = async (orderId, invoiceObject, emailOptionsObject) => {
  const items = await exports.getOrderItems(orderId);

  const invoiceObjectWithItems = await exports.addItemsToInvoiceItems(items, invoiceObject);

  const savedInvoiceName = await exports.createInvoiceAndSave(invoiceObjectWithItems);

  await exports.setEmailAttachmentOptions(savedInvoiceName, emailOptionsObject);

  await emailHelper.sendMail(emailOptionsObject);
};

exports.getOrderItems = async (orderId) => {
  try {
    const orderItems = await Moltin.Orders.Items(orderId);
    return orderItems.data;
  } catch (e) {
    return e;
  }
};

exports.addItemsToInvoiceItems = async (items, invoiceObject) => {
  await asyncForEach(items, async (item) => {
    invoiceObject.items.push({
      name: item.name,
      quantity: item.quantity,
      unit_cost: item.meta.display_price.with_tax.unit.formatted,
    });
  });
  return invoiceObject;
};


exports.createInvoiceAndSave = async (invoiceObject) => {
  const name = `${invoiceObject.to}.pdf`;

  const asyncGenerateInvoice = util.promisify(invoiceGenerator.generateInvoice);

  await asyncGenerateInvoice(invoiceObject, name);
  return name;
};

exports.setEmailAttachmentOptions = async (name, emailOptionsObject) => {
  emailOptionsObject.attachments[0].filename = name;
  emailOptionsObject.attachments[0].path = `./${name}`;
};


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
