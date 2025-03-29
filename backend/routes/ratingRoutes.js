const express = require('express');
const router = express.Router();
const rateController = require('./controllers/ratingController');

// Route to add a new rating
router.post('/rate', rateController.addRating);

// Routes to get ratings by hotel or guide
router.get('/ratings/:type/:id', rateController.getRatings);

module.exports = router;
