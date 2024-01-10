const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const {createCustomer,SetupIntent}= require('./payment');

const app = express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your actual frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}))
app.post('/create-customer',createCustomer);
app.post('/setup-intent',SetupIntent);

mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen((process.env.PORT), () => {
            console.log('Connected to DB and listening to port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })