'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = process.env.NODE_ENV || 'developments';

router.get('/token', (req, res) => {
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.set('Content-type', 'application/json');
            res.status(200).send('false');
        } else {
            // tokenId = payload.userId;
            res.set('Content-type', 'application/json');
            res.status(200).send('true');
        }
    });
});

router.post('/token', (req, res, next) => {
    let validUser;
    if (req.body.email === undefined) {
        res.set('Content-type', 'text/plain');
        res.status(400).send('Email must not be blank');
    } else if (req.body.password === undefined) {
        res.set('Content-type', 'text/plain');
        res.status(400).send('Password must not be blank');
    } else {
        knex('users')
            .where('email', req.body.email)
            .first()
            .then((user) => {
                if (user === undefined) {
                    res.set('Content-type', 'text/plain');
                    res.status(400).send('Bad email or password');
                } else {
                  validUser = user;
                    const password = user.hashed_password
                    return bcrypt.compare(req.body.password, password)
                }
            })
            .then((authUser) => {
              if(authUser === true){
                    const claim = {
                        userId: validUser.id
                    };
                    const token = jwt.sign(claim, process.env.JWT_KEY, {
                        expiresIn: '7 days'
                    });
                    res.cookie('token', token, {
                        path: '/',
                        httpOnly: true,
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                        secure: router.get('env') === 'development' // Set from the NODE_ENV
                    });
                    delete validUser.hashed_password;
                    const result = humps.camelizeKeys(validUser)
                    res.set('Content-Type', 'application/json');
                    res.status(200).send(result);
                }
                else if (authUser === false){
                  res.set('Content-type', 'text/plain');
                  res.status(400).send('Bad email or password');
                }
            })
            .catch((err) => {
                // res.set('Content-type', 'text/plain');
                // res.status(400).send('Bad email or password');
                next(err)
            });
    }
});


router.delete('/token', (req, res, next) => {
    res.clearCookie('token', {
        path: "/"
    });
    res.status(200).send(true);
});


module.exports = router;
