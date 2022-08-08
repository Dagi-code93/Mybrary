const express = require("express");
const router = express.Router();

const Book = require("../models/books");
const Author = require("../models/authors");

const imageMimeTypes = ["image/jpeg", "image/png", "image/png"];

// All Books
router.get("/", async (req, res) => {
    let query = Book.find();
    if(req.query.title != null && req.query.title !== ""){
        query = query.regex("title", new RegExp(req.query.title, "i")); 
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ""){
        query = query.lte("publishDate", req.query.publishedBefore);
    }
    if(req.query.publishedAfter!= null && req.query.publishedAfter != ""){
        query = query.gte("publishDate", req.query.publishedAfter);
    }
    try{
        const books = await query.exec();
        res.render("books/index", {
            books,
            searchOptions: req.query
        })
    }catch(e){
        console.error(e);
        res.redirect("/");
    }
})

// new Books
router.get("/new", async (req, res) => {
    renderNewBook(res, new Book());
})

router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover);
    try{
        const newBook = await book.save();
        // res.redirect(`/books/${newBook.id}`);
        res.redirect("/books");
    }catch(e){
        renderNewBook(res, new Book(), true);
    }
})

async function renderNewBook(res, passedbook, hasError = false){
    try{
        const authors = await Author.find();
        const book = passedbook;
        const params = {
            authors,
            book
        }
        if(hasError) params.errorMessage = "Coundn't create new book";
        res.render("books/create", params);
    }catch{
        res.redirect("/books");
    }
}

function saveCover(book, encodedCover){
    if(encodedCover == null) return;
    const cover = JSON.parse(encodedCover);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverImageType = cover.type;
    }
}

module.exports = router;