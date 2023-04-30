//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

//connecting to the db and creating the todolistdb
mongoose.connect("mongodb+srv://shrutisingh9903:Shruti%401@cluster0.zwn6mk7.mongodb.net/todoListDb" , {useUnifiedTopology: true, useNewUrlParser: true})
console.log("Connected to the db ")

//defining shema 
const itemSchema = new mongoose.Schema({
  name:String
})

const listSchema = new mongoose.Schema({
  name:String,
  items : [itemSchema]
})

const List = mongoose.model("List" , listSchema)
const Item = mongoose.model("Item" , itemSchema)

const entry1 = new Item({name: "Welcome to the to do list"})
const entry2 = new Item({name: "Click (+) to add new item to the list"});
const entry3 = new Item({name: "Click (-) to remove the item from the list"})
const defaultitems = [entry1 , entry2 , entry3] 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

Item.find()
.then(foundItems => {
  if(foundItems == 0){
    Item.insertMany(defaultitems);
    res.redirect("/")
  }  
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems });
  }     
})
.catch(err => console.log(err))
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name : itemName})
  if(listName === "Today"){
    item.save()
    res.redirect("/")
  }
  else{
    List.findOne({name : listName})
    .then(lists =>{
      lists.items.push(item)
      lists.save(); 
      res.redirect("/" + listName);
    })
  }
 
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(checkedItemId);
  console.log(listName);

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId.trim())
    .then(result=>{console.log("success"), res.redirect("/")})

    .catch(err => console.log(err))
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull :{items : {_id :checkedItemId.trim()}}})
    .then(lists=>{
      res.redirect("/" + listName)
    })
    .catch(err=>console.log(err))
  }
  
  
})


app.get("/:name" , function(req, res){
   const rname = _.capitalize(req.params.name)  
   console.log(rname)

  List.findOne({name : rname})
  .then(foundls => {
      if(!foundls){
      console.log("found")
      const list = new List({
        name: rname,
        items :  defaultitems
       })
      list.save()
      res.redirect("/" + rname)
      }
      else{
        console.log("not found")
        res.render("list" , {listTitle : foundls.name, newListItems : foundls.items })
      }
  })
.catch(err => console.log(err))
 
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });


