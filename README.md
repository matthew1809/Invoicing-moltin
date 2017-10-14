# Moltin Invoicing

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

This basic application, once running will:

* Listen for moltin orders being created, and automatically generate a PDF invoice for each order.
* Send an automated email to the customer with their invoice.

## Setup
You'll need to deploy the app and give it the required config vars.

## Webhook
Once you have deployed the app, you'll need to create a moltin webhook and give it your apps url in the configuration. Learn more by following the guide at `# Guide URL ToDo`

## Email
If using the email feature, you'll have to make sure your gmail account has `less secure apps` turned on. More info here: https://myaccount.google.com/lesssecureapps
