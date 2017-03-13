'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const env = process.env.NODE_ENV || 'developments';

// eslint-disable-next-line new-cap
router.get('/favorites',(req, res, next) => {
  return knex('favorites').innerJoin('books', 'favorites.id', 'books.id')
    .then( (user) =>{
      // console.log('what is user',humps.camelizeKeys(user));
      res.status(200).send(humps.camelizeKeys(user))
    })
    .catch( (err) =>{
      console.error(err);
    });
});

router.get('/favorites/check?', function(req, res, next) {
  var value = req.query.bookId;
    console.log('am i getting here');
    return knex('favorites')
      .innerJoin('books', 'favorites.id', 'books.id')
      .where({
            // req.query.book_id =
            'book_id': value
          })
        .first()
        .then((book) => {
            console.log('am i here or not', book);
            if (book) {
                res.set('Content-Type', 'application/json');
                res.send(true);
            }
        })
        .catch( (err) =>{
          console.error(err);
        })
});

// YOUR CODE HERE

module.exports = router;
