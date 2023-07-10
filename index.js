const express = require('express');
const cors = require("cors");
const {router}= require('./routes/restaurantRoute')
const {connection} = require('./config/db');
require('dotenv').config();
const port = process.env.port ; 


const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Home Page");
  });

app.use('/api', router)

app.listen(port, async () => {
    try {
      await connection;
      console.log("Connected to DB");
    } catch (error) {
      console.log(error);
      console.log("Cannot connect to the database");
    }
  });

