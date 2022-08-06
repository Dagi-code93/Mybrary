const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Book = require("../models/books");
const Author = require("../models/authors");

const imageMimeTypes = ["image/jpeg", "image/png", "image/png"];
const uploadPath = path.join("public", Book.bookCoverBasePath);

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
})

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

router.post("/", upload.single("cover"), async (req, res) => {
    const coverImageName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName
    })
    try{
        const newBook = await book.save();
        // res.redirect(`/books/${newBook.id}`);
        res.redirect("/books");
    }catch(e){
        if(coverImageName != null){
            removeBookCover(coverImageName);
        }
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

function removeBookCover(bookFileName){
    fs.unlink(path.join(uploadPath, bookFileName), err => {
        if(err) console.error(err);
    })
}

module.exports = router;