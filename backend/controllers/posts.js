const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // const posts = req.body; // ajouter grâce au BodyParcer
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Posts ajoutés avec succès',
      post: {
        ...createdPost,
        id: createdPost._id, // créé pour éviter d'avoir une erreur en cas de delete juste après ajout (car id:null
      }
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Erreur lors de l\'ajout du post'
    });
  });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id, // obligé pour mettre à jour l'enregistrement
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
    if (result.n > 0) {
      res.status(200).json({message: "Post mis à jour avec succès"});
    } else {
      res.status(401).json({message: "Modification non autorisée"});
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Mise à jour du post impossible'
    })
  });
};

exports.getPosts = (req, res, next) => {
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
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts envoyés avec succès',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Impossible de récupérer les posts'
      })
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: "Post non trouvé"
      });
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Impossible de récupérer le post'
    })
  });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId})
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({message: 'Post effacé'});
      } else {
        res.status(401).json({message: "Suppression non autorisée"});
      }
    }).catch(error => {
    res.status(500).json({
      message: 'Impossible de supprimer le post'
    })
  });
};
