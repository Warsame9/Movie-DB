const express = require('express')
const router = new express.Router()

// models
const Movie = require(__basedir + '/models/movie')
const Comment = require(__basedir + '/models/comment')

const DEFAULT_MOVIES_PER_PAGE = 9;

router.get('/', async (req, res) => {
  res.render('cover');
});

router.get('/movies', async (req, res) => {
  const count = await Movie.count();
  const pageCount = await Math.ceil(count/DEFAULT_MOVIES_PER_PAGE)
  let page =  req.query.page || 1
  page = Number(page)

  //get the movies paginated
  const movies = await Movie.find().skip((page - 1) * DEFAULT_MOVIES_PER_PAGE).limit(DEFAULT_MOVIES_PER_PAGE).lean()

  res.render('movies', {
        results: movies, 
        page: page, 
        next: page + 1, 
        previous: page - 1 || 1, 
        last: pageCount
    });
});

router.get('/movies/:id', async(req, res) => {
  const movieDetails = await Movie.find({_id: req.params.id}).lean()
  
  //sort the comments to most recent
  const movieComments = await Comment.find({movie: req.params.id}).sort({createdAt: -1 }).lean()
  const numOfComments = movieComments.length;
  
  res.render('movieinfo', {movie: movieDetails, comments: movieComments, commentCount: numOfComments})
});

router.post('/movies/:id', async(req, res) => {
  // to check that req.body.commentBody is defined before creating the Comment object
  if (req.body.commentBody) {
    const movie = await Movie.findOne({_id: req.params.id})
    const comment = new Comment({
      movie: movie,
      text: req.body.commentBody 
    })
    comment.save()
      .then(() => {
        res.redirect("/movies/" + req.params.id);
      })
      .catch(error => {
        console.log(error);
      })
  }
  
});

router.get('/comments/:movieId', async(req, res) => {
    const movieId = req.params.movieId;

    //getting all the comments for a specific movie and have it sorted by most recently created
    const movieComments = await Comment.find({movie: movieId}).sort({createdAt: -1}).lean()
    
    res.render('comments', {comments: movieComments});
});

router.get('/search', async (req, res) => {
  let page = req.query.page || 1
  page = Number(page)
  const title = req.query.title;

  // finding movies with title in them
  const search = await Movie.find({title: { $regex: String(title), $options: 'i'}});

  // title search with pagination 
  const movies = await Movie.find({title: { $regex: String(title), $options: 'i'}}).sort({release_date: -1}).skip((page - 1) * DEFAULT_MOVIES_PER_PAGE).limit(DEFAULT_MOVIES_PER_PAGE).lean();
  
  const pageCount = (Math.ceil(search.length/DEFAULT_MOVIES_PER_PAGE));

  res.render('search', {
        results: movies, 
        title: title,
        page: page, 
        next: page + 1, 
        previous: page - 1 || 1,
        last: pageCount
    });
    
});


module.exports = router
