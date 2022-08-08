if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const indexRouter = require("./routes/indexRoutes");
const authorsRouter = require("./routes/authorsRouter");
const booksRouter = require("./routes/bookRouter");

const app = express();

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;

db.on("error", err => console.error(err))
db.on("open", () => console.log("Connnected to db!"));

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit : "10mb", extended: false }))
app.use(methodOverride("_method"));

app.use("/", indexRouter);
app.use("/authors", authorsRouter);
app.use("/books", booksRouter);

app.listen(process.env.PORT || 3000);

// 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