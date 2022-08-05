if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

const indexRoutes = require("./routes/indexRoutes");

const app = express();

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;

db.on("error", err => console.error(err))
db.on("open", () => console.log("Connnected to db!"));

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(express.static("public"));

app.use("/", indexRoutes);

app.listen(process.env.PORT || 3000);