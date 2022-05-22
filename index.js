const express = require('express');
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const port = process.env.PORT || 5000
require('dotenv').config()

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Hello manufacture Website")
})

app.listen(port, () => {
    console.log("Your Server Is Running at", port);
})