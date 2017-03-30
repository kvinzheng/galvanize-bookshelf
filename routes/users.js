'use strict';
const express = require('express');
const router = express.Router();
// const bcrypt = require('bcrypt-as-promised');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const knex = require('../knex.js');
const humps = require('humps');
//write a function that returns a promise that resolves to true if
//user exists, and false if it doesn't call it userExists, should also set the response values correctly in case uswer doesn't exist

//call the function, and based on its resolution value, decide what to do

// userExists()
// .then((haveUser) => {
//   if (haveUser) {
//     res.set('Content-type', 'text/plain');
//     res.status(400).send('Email already exists');
//     return false;
//   } else {
//
//   }
// })

router.post('/users', (req, res, next) => {
    if (req.body.email === undefined) {
        res.set('Content-type', 'text/plain');
        res.status(400).send('Email must not be blank');
    } else if (req.body.password === undefined || req.body.password.length < 8) {
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Password must be at least 8 characters long');
    } else {
        knex('users')
            .where(
                'email', req.body.email
            )
            .returning('*')
            .then((exist) => {
                if (exist[0]) {
                    res.set('Content-type', 'text/plain');
                    res.status(400).send('Email already exists');
                } else {
                    return bcrypt.hash(req.body.password, 12)
                        .then((hashed_password) => {
                            // console.log('am i here');
                            const newUser = {
                                first_name: req.body.firstName,
                                last_name: req.body.lastName,
                                email: req.body.email,
                                hashed_password: hashed_password
                            }
                            const claim = {
                                userId: req.body.email
                            };
                            const token = jwt.sign(claim, process.env.JWT_KEY, {
                                expiresIn: '7 days'
                            });
                            res.cookie('token', token, {
                                httpOnly: true,
                                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                                secure: router.get('env') === 'development' // Set from the NODE_ENV
                            });
                            return knex('users').insert(newUser, '*');
                        })
                        .then((userinfo) => {
                            let userInfo1 = userinfo[0];
                            delete userInfo1.hashed_password;
                            delete userInfo1.created_at;
                            delete userInfo1.updated_at;
                            let camelizeResult = humps.camelizeKeys(userInfo1);
                            res.status(200).json(camelizeResult);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            });
    }
})

module.exports = router;
