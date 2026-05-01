const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imagePath: { type: String, required: true } // imagePath accessed at frontend for a path of where an image is stored at the backend
});

mongoose.model("Post", postSchema);

module.exports = postSchema;