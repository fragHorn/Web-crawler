const mongoDB = require('mongodb');
const MongoClient = mongoDB.MongoClient;
require('dotenv').config();

let _db;

//create a mongoDB connection via a URI
const mongoConnect = callback => {
    //connect to the database...
    MongoClient.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@mydatabase.1cxcq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(client => {
        console.log('Database connected!!');
        _db = client.db();
        //this callback calls the scrapper function in the index.js file...
        callback();
    })
    .catch(err => console.log(err));
};


//get the database connection...
const getDB = () => {
    if(_db)
        return _db;
    throw new Error("Couldn't connect to the database...");
};

module.exports = {
    mongoConnect: mongoConnect,
    getDB: getDB
};