const express = require('express');
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

// Middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mjxci.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    })
}


async function run() {
    try {
        await client.connect()
        console.log("DB Connected");

        const toolCollection = client.db('marufacture').collection('tools')
        const userCollection = client.db('marufacture').collection('users')
        const orderCollection = client.db('marufacture').collection('orders')
        const reviewCollection = client.db('marufacture').collection('reviews')
        const profileCollection = client.db('marufacture').collection('profiles')

        app.get('/tools', async (req, res) => {
            const query = {}
            const cursor = toolCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/tools/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await toolCollection.findOne(query)
            res.send(result)
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
            res.send({ result, token: token });
        })

        app.post('/orders', verifyJWT, async (req, res) => {
            const orders = req.body
            const query = { toolName: orders.toolName, email: orders.email }
            const exists = await orderCollection.findOne(query)
            if (exists) {
                return res.send({ success: false, orders: exists })
            }
            const result = await orderCollection.insertOne(orders)
            res.send({ success: true, result })
        })

        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query?.email
            const decodedEmail = req.decoded?.email
            if (email === decodedEmail) {
                const query = { email: email }
                const orders = await orderCollection.find(query).toArray()
                return res.send(orders)
            }
            else {
                return res.status(403).send({ message: "Forbidded Access" })
            }
        })

        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(filter)
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find({}).toArray()
            res.send(result)
        })

        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.put('/profile_update/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const updatedProfile = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: updatedProfile,
            }
            const result = await profileCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.get('/profile/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await profileCollection.findOne(query)
            res.send(result)
        })

        app.get('/user', verifyJWT, async(req, res) => {
            const users = await userCollection.find().toArray() 
            res.send(users)
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

    }
    finally {
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