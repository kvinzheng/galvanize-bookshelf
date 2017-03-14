'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
// const bcrypt      = require('bcryptjs')
const knex = require('../knex.js');
const humps = require('humps');

router.post('/users', (req, res, next) => {
    bcrypt.hash(req.body.password, 12)
        .then((hashed_password) => {
            return knex('users')
                .insert({
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    email: req.body.email,
                    hashed_password: hashed_password
                }).returning('*');
        })
        .then((users) => {
            let user = users[0];
            let camelizeResult = humps.camelizeKeys(user);
            delete camelizeResult.hashedPassword;
            res.status(200).json(camelizeResult);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
