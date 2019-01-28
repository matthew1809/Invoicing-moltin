exports = module.exports;

const fs = require('fs');
const https = require('https');

const fileWriter = options => postData => async (filename) => {
  const file = fs.createWriteStream(filename);

  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      file.write(chunk);
    })
      .on('end', () => {
        file.end();
      });
  });

  req.write(postData);
  req.end();
};

exports.generateInvoice = invoice => async (filename) => {
  const postData = JSON.stringify(invoice);

  const options = {
    hostname: 'invoice-generator.com',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  await fileWriter(options)(postData)(filename);
};
