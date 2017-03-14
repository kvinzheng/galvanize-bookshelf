'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
// const bcrypt      = require('bcryptjs')
const jwt = require('jsonwebtoken');
const knex = require('../knex.js');
const humps = require('humps');

router.post('/users', (req, res, next) => {
    console.log('what is req.body.email?', req.body.email);
    if (req.body.email === undefined) {
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Email must not be blank');
    }
    if (req.body.password === undefined ) {

        console.log('what is password', req.body.password);
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Password must be at least 8 characters long');
    }
    if (knex('users')
        .where({
            'email': req.body.email
        })
        .returning('*')
        .then((match) => {
            return match === undefined;
        })) {
        console.log('did i pass checking email?');
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Email already exists');
    }
    
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
            console.log('what is users', users);
            const claim = {
                userId: users[0].id
            };
            const token = jwt.sign(claim, process.env.JWT_KEY, {
                expiresIn: '7 days'
            });
            res.cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                secure: router.get('env') === 'production' // Set from the NODE_ENV
            });
            console.log('did i create the cookie and token');
            let camelizeResult = humps.camelizeKeys(users[0]);
            delete camelizeResult.hashedPassword;
            res.status(200).json(camelizeResult);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
