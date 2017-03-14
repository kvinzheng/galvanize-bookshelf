'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const env = process.env.NODE_ENV || 'developments';
let tokenUserid;
// eslint-disable-next-line new-cap
function tokenAuth(req, res, next) {
    console.log(' i have cookie', req.cookies);
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.set('Content-type', 'text/plain');
            res.status(401).send('Unauthorized');
        } else {
            // console.log('this is the payload',payload);
            // { userId: 1, iat: 1489382285, exp: 1489987085 }
            tokenUserid = payload.userId;
            next();
        }
    });
}

// router.use('/favorites',tokenAuth);

router.get('/favorites', tokenAuth, (req, res, next) => {
    return knex('favorites').innerJoin('books', 'favorites.id', 'books.id')
        .then((user) => {
            // console.log('what is user',humps.camelizeKeys(user));
            res.status(200).send(humps.camelizeKeys(user))
        })
        .catch((err) => {
            console.error(err);
        });
});

router.get('/favorites/check?', tokenAuth, (req, res, next) => {
    var value = req.query.bookId;
    // console.log('am i getting here');
    // console.log('what is the type of value',typeof value);
    if( isNaN(value) ){
      // console.log('it is not a number');
      res.status(400);
      res.set('Content-Type', 'text/plain');
      return res.send('Book ID must be an integer');
    }

    return knex('favorites')
        .innerJoin('books', 'favorites.id', 'books.id')
        .where({
            'book_id': value
        })
        .then((book) => {
          console.log('query check',book[0]);
            if (book[0] === undefined) {
                res.send(false);
            }
            // console.log('am i here or not', book);
            if (book[0]) {
                res.set('Content-Type', 'application/json');
                res.send(true);
            }
        })
        .catch((err) => {
            console.error(err);
        })
});

router.post('/favorites', tokenAuth, (req, res, next) => {
    // console.log('this is req body id ',req.body.bookId);
    // console.log('this is tokeruserid', tokenUserid);

    if( (Number.isInteger(req.body.bookId) === false) ){
      res.set('Content-Type', 'text/plain');
      return res.status(400).send('Book ID must be an integer');
    }

      knex('books')
      .where('id', req.body.bookId)
      .first()
      .then( (bookidExist) => {
        // console.log('what is bookidExist', bookidExist);
        if(bookidExist === undefined){
          // console.log('Book not found');
          res.set('Content-Type', 'text/plain')
          return res.status(404).send('Book not found')
        }
      });


      return knex('favorites').insert([{
              'book_id': req.body.bookId,
              'user_id': tokenUserid
          }])
          .returning('*')
          .then((book) => {
               console.log('did infomation get back?', book);
              res.send(humps.camelizeKeys(book[0]));
          })
          .catch((err) => {
              console.error(err);
          })

});

router.delete('/favorites', tokenAuth, (req, res, next) => {
  if( (Number.isInteger(req.body.bookId) === false) ){
    res.set('Content-Type', 'text/plain');
    return res.status(400).send('Book ID must be an integer');
  }

  knex('books')
  .where('id', req.body.bookId)
  .first()
  .then( (bookidExist) => {
    // console.log('what is bookidExist', bookidExist);
    if(bookidExist === undefined){
      // console.log('Book not found');
      res.set('Content-Type', 'text/plain')
      return res.status(404).send('Favorite not found')
    }
  });

    return knex('favorites').where({
            'book_id': req.body.bookId,
        })
        .returning('*')
        .then((deletedBook) => {
            if (deletedBook === undefined) {
                return next();
            }
            return knex('favorites')
                .del()
                .where('book_id', req.body.bookId)
                .returning('*')
                .then((deletedPortion) => {
                    // console.log('what is deletedPortion', deletedPortion);
                    delete deletedPortion[0].id;
                    // console.log('result is here',deletedPortion[0]);
                    res.send(humps.camelizeKeys(deletedPortion[0]));
                })
        })
        .catch((err) => {
            next(err);
        })
});




// YOUR CODE HERE

module.exports = router;
