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
            res.send(false);
        } else {
            res.send(true);
        }
    });
});

router.post('/token', (req, res, next) => {
    return knex('users').where('email', req.body.email).returning('*').first()
        .then((user) => {
            if ((user === undefined)) {
                res.set('Content-Type', 'text/plain');
                res.status(400).send('Bad email or password');
            } else {
                bcrypt.compare(req.body.password, user.hashed_password)
                    .then((result) => {
                        if (result === false) {
                            res.set('Content-Type', 'text/plain');
                            res.status(400).send('Bad email or password');
                        }

                        const claim = {
                            userId: user.id
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
                    });
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
