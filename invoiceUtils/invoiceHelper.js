exports = module.exports;

const emailHelper = require('../emailUtils/emailHelper');
const invoiceGenerator = require('./invoiceGenerator').generateInvoice;
require('util.promisify').shim();

exports.generateInvoiceProcess = Moltin => orderId => invoiceObject => async (emailOptionsObject) => {
  const items = await exports.getOrderItems(orderId)(Moltin);
  const invoiceObjectWithItems = await exports.addItemsToInvoiceItems(items)(invoiceObject);
  const savedInvoiceName = await exports.createInvoiceAndSave(invoiceObjectWithItems);
  exports.setEmailAttachmentOptions(savedInvoiceName)(emailOptionsObject);

  await emailHelper.sendMail(emailOptionsObject);
};

exports.getOrderItems = orderId => async (Moltin) => {
  try {
    const orderItems = await Moltin.Orders.Items(orderId);
    return orderItems.data;
  } catch (e) {
    return e;
  }
};

exports.addItemsToInvoiceItems = items => async (invoiceObject) => {
  const newItems = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit_cost: item.meta.display_price.with_tax.unit.formatted,
  }));

  const InvoiceObjectWithItems = Object.assign({}, invoiceObject, {
    items: newItems,
  });
  return InvoiceObjectWithItems;
};


exports.createInvoiceAndSave = async (invoiceObject) => {
  const name = `${invoiceObject.to}.pdf`;
  await invoiceGenerator(invoiceObject)(name);
  return name;
};

exports.setEmailAttachmentOptions = name => (emailOptionsObject) => {
  const emailOptionsObjectWithInfo = Object.assign({}, emailOptionsObject, {
    attachments:
      [
        {
          filename: name,
          path: `./${name}`,
        },
      ],
  });
  return emailOptionsObjectWithInfo;
};
