// Import dependencies modules:
const cors = require("cors");

const express = require('express')
// const bodyParser = require('body-parser')


// Create an Express.js instance:
const app = express()
var path = require("path");
var fs = require("fs");

// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://SteveSoares:Steve007@cluster0.ypfeo.mongodb.net/test?authSource=admin&replicaSet=atlas-yjkka0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', (err, client) => {
    db = client.db('Webstore')
})

app.use(cors());

app.use(function(req, res, next) {
    var filePath = path.join(__dirname,"static", req.url);
    fs.stat(filePath, function(err, fileInfo) {
    if (err) {
     next();
        return;
    }
    if (fileInfo.isFile()) res.sendFile(filePath);
     else next();
        });
});


// dispaly a message for root path to show that API is working
app.get('/', (req, res, next) => {
  
    res.send('Select a collection, e.g., /collection/messages, this is from heroku server')
})

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})
// search through all the objects from an collection

app.get('/collection/:collectionName/:search', (req, res, next) => {
    req.collection.find({ subject: { $regex: req.params.search, $options: "i" }, location: { $regex: req.params.search, $options: "i" }}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})


//adding post
app.post('/collection/:collectionName', (req, res, next) => {
req.collection.insert(req.body, (e, results) => {
if (e) return next(e)
res.send(results.ops)
})
})

// return with object id 
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id'
, (req, res, next) => {
req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
if (e) return next(e)
res.send(result)
})
})

//update an object 

app.put('/collection/:collectionName/:id', (req, res, next) => {
req.collection.update(
{_id: new ObjectID(req.params.id)},
{$set: req.body},
{safe: true, multi: false},
(e, result) => {
if (e) return next(e)
// res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
res.send(
    result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
    );

})
})





app.delete('/collection/:collectionName/:id', (req, res, next) => {
req.collection.deleteOne(
{ _id: ObjectID(req.params.id) },(e, result) => {
if (e) return next(e)
res.send((result.deletedCount === 1) ?
{msg: 'success'} : {msg: 'error'})
})
})


const port = process.env.PORT || 3000
app.listen(port)

