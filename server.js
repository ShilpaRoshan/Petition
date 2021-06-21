const express = require("express");
const hb = require("express-handlebars");
const path = require("path");
//const db = require("/db.js");

const app = express();
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.get("/petition", (request, response) => {
    response.render("petition", {
        title: "Petition-HomePage",
        //db,
    });
});
/*
app.post("/petition", (request, response) => {
    const { first_name, last_name, signatures } = request.body.db.petitions;
    let error;
    if (!first_name || !last_name) {
        error = "Please fill in the details required!!";
    }
    response.render("petition", { error });
});*/

app.listen(8080, () => {
    console.log("I am listening!!");
});
