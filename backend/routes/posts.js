const express = require('express');
const postsRouter = express.Router();

const Post = require('../models/post');

postsRouter.post('', (req, res, next) => {
  // const posts = req.body; // ajouter grâce au BodyParcer
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(result => {
    res.status(201).json({
      message: 'Posts ajoutés avec succès',
      postId: result._id // créé pour éviter d'avoir une erreur en cas de delete juste après ajout (car id:null
    });
  });
});

postsRouter.put('/:id', (req, res, next) => {
  const post = new Post({
    _id: req.body.id, // obligé pour mettre à jour l'enregistrement
    title: req.body.title,
    content: req.body.content,
  });
  Post.updateOne({_id: req.params.id}, post).then(result => {
    res.status(200).json({
      message: "Post mis à jour avec succès"
    })
  });
});

postsRouter.get('', (req, res, next) => {
  Post.find()
    .then(documents => {
      console.log(documents);
      res.status(200).json({
        message: 'Post envoyés avec succès',
        posts: documents
      });
    });
});

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
