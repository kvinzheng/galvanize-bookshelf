'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex.js');
const humps = require('humps');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const env = process.env.NODE_ENV || 'developments';
// require('dotenv').config();

router.get('/token', (req, res, next) => {
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
            console.log('before compare', user);
            bcrypt.compare(req.body.password, user.hashed_password)
                .then(() => {
                    // console.log(' i am here');
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
                    console.log('am i here?');
                    res.set('Accept', 'application/json');
                    res.set('Content-Type', 'application/json');
                    delete user.hashed_password;
                    // delete user.id;
                    // delete user.first_name;
                    delete user.last_lame;
                    res.send(humps.camelizeKeys(user));

                    //
                    // let user = users[0];
                    // let camelizeResult = humps.camelizeKeys(user);
                    // delete camelizeResult.hashedPassword;
                    // res.status(200).json(camelizeResult);

                })
        })
});


// router.post('/users', (req, res, next) => {
//     bcrypt.hash(req.body.password, 12)
//         .then((hashed_password) => {
//             return knex('users')
//                     .where({
//                       email: req.body.email,
//                       hashed_password: hashed_password
//                     }).returning('*').first()
//         .then((user) => {
//             let camelizeResult = humps.camelizeKeys(user);
//             delete camelizeResult.hashedPassword;
//             res.status(200).json(camelizeResult);
//         })
//         .catch((err) => {
//             next(err);
//         });
//     });
// });

module.exports = router;
