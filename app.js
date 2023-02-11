const express = require("express");
const app = express();
const cors = require("cors");
const AWS = require("aws-sdk");
// const mongoose = require("mongoose");
// const db = require("./models");

require('dotenv').config()
const PORT = process.env.PORT || 8081;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Add routes, both API and view
const corsOptions ={
  origin: "*",
  methods: "OPTIONS, GET, POST, PUT, PATCH"
}
app.use(cors(corsOptions))

// Start the API server
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

//AWSCONFIG

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_ORDER = "covingtonfirefish-order"

/////Orders///

/*

orderId: number
name: String
phone: String
email: String
orderType :String
    if delivery:
        orderAddress
orderTime: Date
paymentReceived: bool
orderComplete: bool
items: Array
totalPrice: number


items:
  name
  price
  itemId
*/
//Create order

/*
in order to post a load, we must figure out the total number of previous orders in order to generate an order number

get all orders,
return response.count
then app.post:
with order id: response.count in the format of 00001

return order response in object


*/
app.post("/api/order/create/", async (req, res) => {
  try {
    const order = { 
        orderId: req.body.orderId, 
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        orderType: req.body.orderType,
        orderAddress: req.body.orderAddress,
        paymentReceived: false,
        orderComplete: false,
        items: [ req.body.items ]
    }
    const params = {
      TableName: TABLE_ORDER,
      Item: order
    }
    await dynamoClient.put(params).promise()
    .then(res.send("Success"))
  } catch {
      res.status(201).send()
  }
});

app.get("/api/order/:id", async (req, res) => {
  const params = {
    TableName: TABLE_ORDER,
    Key: {
      orderId: Number(req.params.id)
    }
  }
  await dynamoClient.get(params).promise()
  .then(result => res.send(result.Item))
  .catch(err => res.send(err))
})
