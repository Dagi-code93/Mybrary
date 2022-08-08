const mongoose = require("mongoose");

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
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
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
    if(this.coverImageType != null && this.coverImage != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString("base64")}`;
    }
});

module.exports = mongoose.model("Book", booksSchema);