const mongoDB = require('mongodb');
const MongoClient = mongoDB.MongoClient;
require('dotenv').config();

let _db;

const mongoConnect = callback => {
    MongoClient.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@mydatabase.1cxcq.mongodb.net/Airtribe?retryWrites=true&w=majority`,
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(client => {
        console.log('Database connected!!');
        _db = client.db();
        callback();
    })
    .catch(err => console.log(err));
};

const getDB = () => {
    if(_db)
        return _db;
    throw new Error("Couldn't connect to the database...");
};

module.exports = {
    mongoConnect: mongoConnect,
    getDB: getDB
};