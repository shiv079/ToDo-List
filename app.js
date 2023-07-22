const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

const items = [" Food", "Cook Food", "Eat Food"];
const workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let uri = "mongodb+srv://Himanshu079:password262111@cluster0.uj1j7kp.mongodb.net/?retryWrites=true&w=majority"
mongoose
  .connect(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((resp) => console.log("Connected"))
  .catch((err) => console.log(err));

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist.",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<--Hit this to delete to add new item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems)
// .then(()=>{
//   console.log("Successfully saved default items to DB.");
// }).catch(err=>{
//   console.log(err);
// });
////////////////////////////////////////////////
// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully saved default items to DB.");
//   }
// });

app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    //  Item.find({},function(err, foundItems){
    //   console.log(foundItems);
    //  });

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("Successfully saved default items to DB.");
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

///////////////////////////////////////////////////////////////////////////
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  //  List.findOne({name:custonListName},function(err, foundList){
  //   if(!err){
  //     if(!foundList){
  //       console.log("Doesn't exists");
  //     }else{
  // console.log("Exists!");
  //     }
  //   }
  //  });

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        ///////create a new List
        const list = new List({
          name: customListName,
          items: defaultItems,
          // console.log("Doesn't exists");
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //////show the existing List
        // console.log("Exists!");
        res.render("List", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.error("Error occurred:", err);
    });
});
/////////////////////////////////////////////////////////////////

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    // List.findOne({name:listName}, function(err, foundList){
    //   foundList.items.push(item);
    //   foundList.save();
    //   res.redirect("/"+listName)
    // });
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        return foundList.save();
      })
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error("Error occurred:", err);
      });
  }
});
// if(req.body.list === "Work"){
//   workItems.push(item);
//   res.redirect("/work");
// }else{
//   items.push(item);
//   res.redirect("/");
// }
////////////////////////////////////////////////////////////////////////
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    //  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
    //   if(!err){
    //     req.redirect("/" + listName);
    //    }
    //  });
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then((foundList) => {
        if (foundList) {
          // console.log("Successfully Update item.");
          res.redirect("/" + listName);
        }
      })
      .catch((err) => {
        console.error("Error occurred:", err);
      });
  }
});

// Item.findIdAndRemove(checkedItemId,function(err){
//   if(!err){
//     console.log("Successfully deleted checked item.");
//   res.redirect("/");
//   }
// });

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems })
// });

// app.post("/work", function (req, res) {
//   const item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });
////////////////////////////////////////////////////////////////////

app.get("/about", function () {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
