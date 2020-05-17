const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
 
const app = express();
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
 
let dbClient;

app.use(express.static(__dirname + "/views"));

mongoClient.connect(function(err, client){
    if (err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("notesdb").collection("notes");
    app.listen(3000, function(){
        console.log("Сервер ожидает подключения...");
    });
});

app.get("/api/notes", function (request, response) {
    
    const collection = request.app.locals.collection;
    collection.find({}).toArray(function(err, notes){
         
    if (err) return console.log(err);
    response.send(notes);
    });
});

app.get("/api/notes/:id", function(request, response) {        

    const id = new objectId(request.params.id);
    const collection = request.app.locals.collection;

    collection.findOne({_id: id}, function(err, note){
               
        if (err) return console.log(err);
        response.send(note);
    });
});

app.post("/api/notes", jsonParser, function (request, response) {
     
    if(!request.body) return response.sendStatus(400);
     
    var noteCaption = request.body.caption;
    var noteContent = request.body.content;
    var noteStatus = request.body.status;
    var noteDate = new Date(Date.now()).toLocaleDateString('en-US');
    var note = {
        caption: noteCaption, 
        content: noteContent,
        status: noteStatus,
        date: noteDate
    };    
       
    const collection = request.app.locals.collection;
    collection.insertOne(note, function(err, result){
               
        if (err) return console.log(err);
        response.send(note);
    });
});

app.delete("/api/notes/:id", function(request, response){

    const id = new objectId(request.params.id);
    const collection = request.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if (err) return console.log(err);    
        let note = result.value;
        response.send(note);
    });
});

app.put("/api/notes", jsonParser, function(request, response){
      
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);
    const id = new objectId(request.body.id);
    const noteCaption = request.body.caption;
    const noteContent = request.body.content;
    const noteStatus = request.body.status;
    const noteDate = new Date(Date.now()).toLocaleDateString('en-US');
       
    const collection = request.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: 
        {
            caption: noteCaption,
            content: noteContent,
            status: noteStatus,
            date: noteDate
        }
    },
    { returnOriginal: false },
    function(err, result) {               
        if (err) return console.log(err);     
        const note = result.value;
        response.send(note);
    });
});


app.get("/api/filter/:status", function(request, response) { 

    const collection = request.app.locals.collection;
    const status = request.params["status"];
    if (status.localeCompare("Notes") == 0) {
        collection.find({}).toArray(function(err, notes){            
            if (err) return console.log(err);
            response.send(notes);
        });
    }
    else {
        let statuses = new Map([
            ["New", "Новая"],
            ["Process", "Обрабатывается"],
            ["Complete", "Завершено"]
          ]);
    
        collection.find({ status: statuses.get(status)}).toArray(function(err, notes) {
            if (err) return console.log(err);
                response.send(notes);
        });
    }
    
    
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});