const mongoose = require("mongoose");
const path = require("path");

const bookCoverBasePath = "uploads/bookCovers";

const booksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    }
}, { timestamps: true })

booksSchema.virtual("coverImagePath").get(function(){
    return path.join("/", bookCoverBasePath, this.coverImageName);
});

module.exports = mongoose.model("Book", booksSchema);
module.exports.bookCoverBasePath = bookCoverBasePath;