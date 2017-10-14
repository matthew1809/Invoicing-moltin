var fs         = require("fs");
var AWS        = require('aws-sdk');

// require our env package
require('dotenv').config();

AWS.config.update({
  region: process.env.bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.IdentityPoolId
  })
});

let base64data;

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: process.env.albumBucketName}
});

var upload = (body) => {
  s3.upload({
      Bucket: process.env.albumBucketName,
      Key: 'invoice.pdf',
      Body: body,
      ACL: 'public-read'
    },function (resp) {
      console.log(arguments);
      console.log('Successfully uploaded package.' + resp);
    });

}

var baseFile = (file) => {
  fs.readFile(file, function (err, data) {
  if (err) { throw err; }

  base64data = new Buffer(data, 'binary');
  upload(base64data);
  })

};

exports.upload = upload;
exports.baseFile = baseFile;
