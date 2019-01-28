require('dotenv').load();
const { expect } = require('chai');

const moltin = require('@moltin/sdk');

const Moltin = moltin.gateway({
  client_id: process.env.moltin_client_id,
  client_secret: process.env.moltin_client_secret,
});

const { getOrderItems } = require('../invoiceUtils/invoiceHelper');

describe('getOrderItems()', () => {
  it('should fetch order items given a Moltin order ID', async () => {
    const orders = await Moltin.Orders.Limit(1).All();
    const { id } = orders.data[0];
    const testItems = await Moltin.Orders.Items(id);
    const items = await getOrderItems(id);

    expect(testItems.data.length).to.be.equal(items.length);
  });
});
