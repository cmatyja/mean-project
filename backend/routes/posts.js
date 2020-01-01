const express = require('express');
const postsRouter = express.Router();

const Post = require('../models/post');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    callback(error, "backend/images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

postsRouter.post('', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // const posts = req.body; // ajouter grâce au BodyParcer
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Posts ajoutés avec succès',
      post: {
        id: createdPost._id, // créé pour éviter d'avoir une erreur en cas de delete juste après ajout (car id:null
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  });
});

postsRouter.put('/:id', multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id, // obligé pour mettre à jour l'enregistrement
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id: req.params.id}, post).then(result => {
    res.status(200).json({
      message: "Post mis à jour avec succès"
    })
  });
});

postsRouter.get('', (req, res, next) => {
  const pageSize = +req.query.nbpage;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Post envoyés avec succès',
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

// All posts
postsRouter.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: "Post non trouvé"
      });
    }
  })
});

postsRouter.delete('/:id', (req, res, next) => {
  Post.deleteOne({
    _id: req.params.id
  })
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'Post effacé'
      })
    });

});

module.exports = postsRouter;
