require('dotenv').load();
const expect = require('chai').expect;

const moltin = require('@moltin/sdk');

const Moltin = moltin.gateway({
  client_id: process.env.moltin_client_id,
  client_secret: process.env.moltin_client_secret,
});

const getOrderItems = require('../invoiceUtils/invoiceHelper').getOrderItems;

describe('getOrderItems()', () => {
  it('should fetch order items given a Moltin order ID', async () => {
    
  	let orders = await Moltin.Orders.Limit(1).All();
  	let id = orders.data[0].id;
  	let testItems = await Moltin.Orders.Items(id);
  	let items = await getOrderItems(id);

    expect(testItems.data.length).to.be.equal(items.length);

  });
});