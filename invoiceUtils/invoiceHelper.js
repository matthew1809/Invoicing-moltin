exports = module.exports;

const util = require('util');
const emailHelper = require('../emailUtils/emailHelper');
const invoiceGenerator = require('./invoiceGenerator');
require('util.promisify').shim();

exports.generateInvoiceProcess = Moltin => orderId => invoiceObject => async emailOptionsObject => {

  const items = await exports.getOrderItems(orderId, Moltin);

  const invoiceObjectWithItems = await exports.addItemsToInvoiceItems(items, invoiceObject);

  const savedInvoiceName = await exports.createInvoiceAndSave(invoiceObjectWithItems);

  await exports.setEmailAttachmentOptions(savedInvoiceName, emailOptionsObject);

  await emailHelper.sendMail(emailOptionsObject);
};

exports.getOrderItems = async (orderId, Moltin) => {
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
