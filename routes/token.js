'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = process.env.NODE_ENV || 'developments';
let tokenId;

const ev = require('express-validation');
const validations = require('../validations/users');
// function Auth(req, res, next){
//       console.log(' i have cookie', req.cookies);
//       jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
//           if (err) {
//               res.set('Content-type', 'text/plain');
//               res.status(401).send('Unauthorized');
//           } else {
//               // console.log('this is the payload',payload);
//               // { userId: 1, iat: 1489382285, exp: 1489987085 }
//               tokenUserid = payload.userId;
//               next();
//           }
//       });
// };

router.get('/token', (req, res) => {
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.send(false);
        } else {
            tokenId = payload.userId;
            res.send(true);
        }
    });
});

router.post('/token', (req, res, next) => {
  // console.log("i am kevin",req.body.email);
    if(req.body.email === undefined){
      res.set('Content-type', 'text/plain');
      return res.status(400).send('Email must not be blank');
    }
     if(req.body.password === undefined){
      res.set('Content-type', 'text/plain');
      return res.status(400).send('Password must not be blank');
    }

    let user;

    return knex('users').where('email', req.body.email).returning('*').first()
        .then((userFilter) => {
            user = userFilter;
            // console.log('what is user?',userFilter);
            if (user === undefined) {
                res.set('Content-Type', 'text/plain');
                return res.status(400).send('Bad email or password');
            } else {
                return bcrypt.compare(req.body.password, user.hashed_password);
            }
        })
        // .then(()=>{
        //   return knex('users')
        //           .where('email', req.body.email)
        //         })
        .then((result) => {
            if (result === false) {
                res.set('Content-Type', 'text/plain');
                res.status(400).send('Bad email or password');
            }
            else{
              // console.log('what is user', result);
              const claim = {
                  userId: result.id
              };
              const token = jwt.sign(claim, process.env.JWT_KEY, {
                  expiresIn: '7 days'
              });
              res.cookie('token', token, {
                  httpOnly: true,
                  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                  secure: router.get('env') === 'production' // Set from the NODE_ENV
              });
              res.set('Content-Type', 'application/json');
              delete user.hashed_password;
              res.send(humps.camelizeKeys(user));
            }
        })
        .catch((err) => {
            console.error(err);
        });

});

router.delete('/token', (req, res, next) => {
    res.clearCookie('token');
    res.send(true);
});


module.exports = router;
