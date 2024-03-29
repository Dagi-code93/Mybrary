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
        res.redirect(`/books/${newBook.id}`);
    }catch(e){
        renderNewBook(res, new Book(), true);
    }
})

router.get("/:id", async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate("author").exec();
        res.render("books/show", {book});
    }catch{
        res.redirect("/");
    }
});

router.get("/:id/edit", async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    }catch{
        res.redirect("/");
    }
});

router.put("/:id", async (req, res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        book.title =  req.body.title;
        book.author =  req.body.author;
        book.publishDate =  new Date(req.body.publishDate);
        book.pageCount =  req.body.pageCount;
        book.description =  req.body.description;
        if(req.body.cover != null && req.body.cover != ""){
            saveCover(book, req.body.cover)
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    }catch{
        if(book != null){
            renderEditPage(res, book, true);
        }else{
            res.redirect("/");
        }
    }
})

router.delete("/:id", async (req, res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect("/books");
    }catch{
        if(book != null){
            res.render("books/show", {
                book,
                errorMessage: "Coudn't remove book"
            })
        }else{
            res.redirect("/");
        }
    }
});

async function renderNewBook(res, book, hasError = false){
    renderFormPage(res, book, "create", hasError);
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, passedBook, file, hasError=false){
    try{
        const authors = await Author.find();
        const book = passedBook;
        const params = {
            authors,
            book
        }
        if(hasError){
            if(file == "edit"){
                params.errorMessage = "Coundn't edit book";
            }else{
                params.errorMessage = "Coundn't create new book";
            }
        }
        res.render(`books/${file}`, params);
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