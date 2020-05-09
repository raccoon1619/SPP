const express = require("express");
 
const app = express();
const bodyParser = require("body-parser");

var fs = require("fs");
const urlencodedParser = bodyParser.urlencoded({extended: false});0
 
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));

app.post("/applyEdit/:noteId", urlencodedParser, function(request, response) {
    if (!request.body) return response.sendStatus(400);

    var id = request.params["noteId"];
    var data = fs.readFileSync("notes.json", "utf8");
    var notes = JSON.parse(data);
    var index = -1;
    // находим индекс заметки в массиве
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].id == id){
            index = i;
            break;
        }
    }

    if (index > -1) {
        notes[index].caption = request.body.caption;
        notes[index].content = request.body.content;
        notes[index].status = request.body.status;
        notes[index].date = new Date(Date.now()).toLocaleDateString('en-US');

        data = JSON.stringify(notes);
        fs.writeFileSync("notes.json", data);

        response.redirect("/");
    }
    else {
        response.status(404).send();
    }
});

app.get("/filter/:status", function(request, response) { 
      

    if (request.params["status"].localeCompare("All") == 0) {
        response.redirect("/");
        return;
    }

    let statuses = new Map([
        ["New", "Новая"],
        ["Process", "Обрабатывается"],
        ["Complete", "Завершено"]
      ]);
    
    let status = statuses.get(request.params["status"]);

    var filterNotes = [];
    var data = fs.readFileSync("notes.json", "utf8");
    var notes = JSON.parse(data);
   
    for (var i = 0; i < notes.length; i++) {
 
        if (status.localeCompare(notes[i].status) == 0)
        {
            filterNotes.push(notes[i]);
        }
    }

    response.render("index", {
        notes: filterNotes
    });
});

app.post("/edit/:noteId", function(request, response) { 
    var id = request.params["noteId"];
    var data = fs.readFileSync("notes.json", "utf8");
    var notes = JSON.parse(data);
    var index = -1;
    // находим индекс заметки в массиве
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].id == id){
            index = i;
            break;
        }
    }

    if (index > -1) {
        response.render("edit", {
        editNote: notes[index]
        });
    }
    else {
        response.status(404).send();
    }

});
 
app.post("/delete/:noteId", function(request, response) {

    var id = request.params["noteId"];
    var data = fs.readFileSync("notes.json", "utf8");
    var notes = JSON.parse(data);
    var index = -1;
    // находим индекс заметки в массиве
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].id == id){
            index = i;
            break;
        }
    }
    if (index > -1) {
        notes.splice(index, 1);
        data = JSON.stringify(notes);
        fs.writeFileSync("notes.json", data);

        response.redirect("/");
    }
    else {
        response.status(404).send();
    }
});

app.post("/", urlencodedParser, function(request, response) {
    if (!request.body) 
        return response.sendStatus(400);

        var data = fs.readFileSync("notes.json", "utf8");
        var notes = JSON.parse(data);
        var noteId;
        var newDate = new Date(Date.now());
        
        if (notes[0] == null) {
            noteId = 1;
        } 
        else {
            var noteId = Math.max.apply(Math, notes.map(function(o){return o.id;}));
            noteId++;
        }

        var newNote = {
            id: noteId, 
            caption: request.body.caption,
            content: request.body.content,
            status: request.body.status,
            date: newDate.toLocaleDateString('en-US')
        };
         
        notes.push(newNote);

        data = JSON.stringify(notes);
        // перезаписываем файл с новыми данными
        fs.writeFileSync("notes.json", data);
        response.redirect("/");
});

app.get("/", function(request, response){ 

    var content = fs.readFileSync("notes.json", "utf8");
    var note = JSON.parse(content);

    response.render("index", {
        notes : note
    });
});


app.listen(3000);