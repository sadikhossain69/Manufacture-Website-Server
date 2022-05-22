const express = require('express');
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

// Middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mjxci.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try{
        await client.connect()
        console.log("DB Connected"); 

        const toolCollection = client.db('marufacture').collection('tools')

        app.get('/tools', async(req, res) => {
            const query = {}
            const cursor = toolCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send("Hello manufacture Website")
})

app.listen(port, () => {
    console.log("Your Server Is Running at", port);
})