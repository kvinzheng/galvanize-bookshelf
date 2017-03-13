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
console.log('am i here?');
router.get('/favorites',(req, res, next) => {
  return knex('favorite')
    .then( (user) =>{
      console.log(user);
      res.status(200).send(user)
    })
    .catch( (err) =>{
      console.error(err);
    });
});

router.get('/favorites/check?bookId=:req.params.id', function(req, res, next){
    knex('favorites').where({book_id:req.params.id}).first()
    .then( (article)=>{
        if(article){
          res.send(true);
        }
    })
});

// YOUR CODE HERE

module.exports = router;
