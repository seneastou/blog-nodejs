const express = require('express');
const router = express.Router();

// Sample data (replace this with your actual data storage)
let blogPosts = [
  { id: 1, title: 'First Blog Post', content: 'This is the content of the first blog post.' },
  // Add more blog posts as needed
];

// Display all blog posts
router.get('/', (req, res) => {
  res.render('index', { blogPosts });
});

// Display form to add a new blog post
router.get('/new', (req, res) => {
  res.render('new');
});

// Create a new blog post
router.post('/new', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: blogPosts.length + 1, title, content };
  blogPosts.push(newPost);
  res.redirect('/');
});

// Display form to edit a blog post
router.get('/edit/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = blogPosts.find(post => post.id === id);
  res.render('edit', { post });
});

// Update a blog post
router.post('/edit/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const postIndex = blogPosts.findIndex(post => post.id === id);
  blogPosts[postIndex] = { id, title, content };
  res.redirect('/');
});

// Delete a blog post
router.post('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  blogPosts = blogPosts.filter(post => post.id !== id);
  res.redirect('/');
});

module.exports = router;