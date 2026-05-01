// EXPRESS MIDDLEWARE. Where we set up our database middleware, our routes, etc.

const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./models/post")
const multer = require("multer");

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://kene:kene1234@cluster0.8jldg2x.mongodb.net/?appName=Cluster0")
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error)
    })

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  // Generate a unique filename for the uploaded file
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

// Setup CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    console.log("Middleware")
    next();
})

/*
app.post("/api/posts", (req, res, next) => {
    const post = req.body;
    console.log(post);
    res.status(201).json({
        message: "Post added successfully"
    })
})
*/

app.post("/api/posts", multer({storage: storage}).single("image"), (req, res, next) => {
    // Get the URL from the request
    const url = req.protocol + "://" + req.get("host");

    // Use body-parser
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images" + req.file.filename
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: "Post added successfully",
            post: {
                ...createdPost, // Create a copy of the created post (title, content, imagePath)
                id: createdPost._id,
            }
            //postId: createdPost._id
        })
    })
})

app.put("/api/posts/:id", (req, res, next) => {
    const post = new Post({
        _id: req.params.id,
        title: req.body.title,
        content: req.body.body.content
    });
    Post.updateOne({_id: req.params.id}, post).then(result => {
        res.status(200).json({message: "Update successful!"});
    });
});

app.use("/api/posts", (req, res, next) => {
    const posts = [
        { 
            id: 681845,
            title: "1 server Post",
            content: "This is coming from the server"
        }, {
            id: 681846,
            title: "2 server Post",
            content: "This is coming from the server too"
        }, {
            id: 681847,
            title: "3 server Post",
            content: "This is coming from the server too"
        }
    ]
    res.status(200).json({
        message: "",
        posts: posts
    })
})

app.get("/api/posts", (req, res, next) => {
    Post.find().then(documents => {
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: documents
        })
    })
})

//app.get('/', (req, res) => res.send('Hello World!'))
app.use((req, res, next) => {
    console.log("Middleware started");
    next();
});

app.use((req, res, next) => {
    res.send("Hello world from express");
});

app.delete('api/posts/:id', (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({message: "Post deleted!"});
    })
})

module.exports = app; // export express for server.js to use