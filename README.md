# Moltin Invoicing

This basic application, once deployed will listen for moltin orders being created, and automatically generate a PDF invoice for each order.

## Setup
You'll need to create your own config file at the repo root, which should contain the following, but with the empty strings filled in:

```
# Your moltin client ID
var client_id = '';
# Your moltin client Secret
var client_secret = '';

# Your email provider e.g. gmail
var service = ''
# Your email address
var user = ''
# Your email password
var pass = ''


exports.client_id = client_id;
exports.client_secret = client_secret;
exports.service = service;
exports.user = user
exports.pass = pass
```


## Email
If using the email feature, you'll have to make sure your gmail account has `less secure apps` turned on. More info here: https://myaccount.google.com/lesssecureapps
