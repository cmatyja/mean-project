const express = require('express');
const postsRouter = express.Router();

const PostController = require('../controllers/posts');

const checkAuth = require('../middlewares/check-auth');
const extractFile = require('../middlewares/file');

postsRouter.post('', checkAuth, extractFile, PostController.createPost);

postsRouter.put('/:id', checkAuth, extractFile, PostController.updatePost);

// All posts
postsRouter.get('', PostController.getPosts);

//one post
postsRouter.get('/:id', PostController.getPost);

postsRouter.delete('/:id',
  checkAuth,
  PostController.deletePost
);

module.exports = postsRouter;
