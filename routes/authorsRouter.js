const express = require("express");
const router = express.Router();

const Author = require("../models/authors");

// All Authors
router.get("/", async (req, res) => {
    const searchOptions = {};
    if(req.query.name !== null && req.query.name!==""){
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try{
        const authors = await Author.find(searchOptions);
        res.render("authors/index", {
            authors,
            searchOptions: req.query
        }); 
    }catch{
        res.redirect("/");
    }
})

// new Authors
router.get("/new", (req, res) => {
    res.render("authors/create", { author: new Author() });
})

router.post("/", async (req, res) => {
    const author = new Author({
        name : req.body.name
    });
    try{
        const newAuthor = await author.save();
        // res.redirect(`/authors/${newAuthor._id}`);
        res.redirect("/authors")
    }catch{
        res.render("authors/create", {
            author: author,
            errorMessage: "Not able to create author."
        })
    }
})

module.exports = router;