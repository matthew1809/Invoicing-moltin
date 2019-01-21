exports = module.exports;

const fs = require('fs');
const https = require('https');

exports.generateInvoice = function (invoice, filename, success, error) {
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

  const file = fs.createWriteStream(filename);

  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      file.write(chunk);
    })
      .on('end', () => {
        file.end();

        if (typeof success === 'function') {
          success();
        }
      });
  });
  req.write(postData);
  req.end();

  if (typeof error === 'function') {
    req.on('error', error);
  }
};
