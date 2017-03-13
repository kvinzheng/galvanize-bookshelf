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
function tokenAuth(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
          res.set('Content-type','text/plain');
          res.status(401).send('Unauthorized');
      } else {
          // console.log('this is the request', req);
          // req.token = payload;
          console.log('this is the payload',payload);
          next();
      }
  });
}
router.get('/favorites', tokenAuth,(req, res, next) => {
  return knex('favorites').innerJoin('books', 'favorites.id', 'books.id')
    .then( (user) =>{
      // console.log('what is user',humps.camelizeKeys(user));
      res.status(200).send(humps.camelizeKeys(user))
    })
    .catch( (err) =>{
      console.error(err);
    });
});

router.get('/favorites/check?',tokenAuth, function(req, res, next) {
  var value = req.query.bookId;
    // console.log('am i getting here');
    return knex('favorites')
      .innerJoin('books', 'favorites.id', 'books.id')
      .where({
            'book_id': value
          })
        .first()
        .then((book) => {
          if(book === undefined){
            res.send(false);
          }
            // console.log('am i here or not', book);
            if (book) {
                res.set('Content-Type', 'application/json');
                res.send(true);
            }
        })
        .catch( (err) =>{
          console.error(err);
        })
});

router.post('/favorites', tokenAuth, (req, res, next) =>{
  console.log(' cookie is here', req.cookies);
    req.cookies.token
  return knex('favorites').insert({
        'book_Id': req.body.bookId,
        'user_id':user.id
      })
      .then((book) =>{
        console.log('did infomation get back?', book);
        res.send(book);
      })
      .catch( (err) =>{
        console.error(err);
      })
});




// YOUR CODE HERE

module.exports = router;
