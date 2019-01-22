# Moltin Invoicing

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

This basic application, once running will:

* Listen for moltin orders being created, and automatically generate a PDF invoice for each order.
* Send an automated email to the customer with their invoice.

## Setup
You'll need to deploy the app and give it the required config vars via .env, you're welcome to clone the .example.env and add your own values.

## Webhook
Once you have deployed the app, you'll need to create a moltin webhook and give it your apps url in the configuration appended with the  `/orders` route. You can create a moltin webhook like so:
```
     -H "Authorization: a5a149059dcdbd640006b1319d17cb1809ab1325" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "data": {
    "configuration": {
      "url": "http://5e082d80.ngrok.io/orders"
    },
    "observes": [
      "order.created"
    ],
    "enabled": true,
    "type": "integration",
    "name": "invoicing",
    "integration_type": "webhook"
  }
}'
```

## Email
If using the email feature, you'll have to make sure your gmail account has `less secure apps` turned on. More info here: https://myaccount.google.com/lesssecureapps

## S3
This app also provides the ability to save PDF invoices to an S3 bucket. *The functionality is a WIP*.