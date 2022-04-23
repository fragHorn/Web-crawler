const { getDB } = require('./db');

//create a model for question
module.exports = class Questions {
    // constructor to initialize the instance of Questions
    constructor(title, references, upvotes, answers, url){
        this.title = title;
        this.references = references;
        this.upvotes = upvotes;
        this.answers = answers;
        this.url = url;
    };


    //this function saves the data in the database
    save(){

        //get the database connection
        const db = getDB();
        //find whether the url is already present in the database.
        //if it is already present then increase the count of references by one,
        //otherwise insert new data in the database...
        return db.collection('questions').find({url: this.url}).next()
            .then(res => {
                if(!res){
                    //adds the new question data in the database
                    return db.collection('questions').insertOne(this);
                }
                else{
                    //updates the count of references of the question
                    return db.collection('questions').updateOne({url: this.url}, {$set: {references: res.references + 1}});
                }
            })
            .catch(err => console.log(err));
    };


    //returns all the data of the questions stored in the database...
    static retrieveAll(){
        const db = getDB();
        return db.collection('questions').find().toArray();
    }
}