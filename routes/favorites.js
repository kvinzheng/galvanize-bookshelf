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
// router.use('/favorites', (req, res, next) => {
//     jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
//         if (err) {
//             res.set('Content-type', 'text/plain');
//             res.status(401).send('Unauthorized');
//         } else {
//             // { userId: 1, iat: 1489382285, exp: 1489987085 }
//             tokenUserid = payload.userId;
//             next();
//         }
//     });
// });
router.get('/favorites', (req, res, next) => {
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.set('Content-type', 'text/plain');
            res.status(401).send('Unauthorized');
        } else {
            return knex('favorites').innerJoin('books', 'favorites.id', 'books.id')
                .innerJoin('users', 'users.id', 'favorites.user_id').select('favorites.id', 'book_id', 'user_id', 'books.created_at', 'books.updated_at', 'title', 'author', 'genre', 'description', 'cover_url')
                .where('users.id', payload.userId)
                .then((user) => {
                    res.status(200).send(humps.camelizeKeys(user))
                })
                .catch((err) => {
                    next(err);
                });
        }
    })
});

router.get('/favorites/check?', (req, res, next) => {
    if (isNaN(req.query.bookId)) {
        res.status(400);
        res.set('Content-Type', 'text/plain');
        return res.send('Book ID must be an integer');
    }

    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.set('Content-type', 'text/plain');
            res.status(401).send('Unauthorized');
        } else {
            return knex('favorites')
                .innerJoin('books', 'favorites.id', 'books.id')
                .innerJoin('users', 'users.id', 'favorites.user_id')
                .where('users.id', payload.userId)
                .andWhere('book_id', req.query.bookId)
                .then((book) => {
                    if (book[0] === undefined) {
                        res.set('Content-Type', 'application/json');
                        res.send(false);
                    } else {
                        res.set('Content-Type', 'application/json');
                        res.send(true);
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        }
    });
});

router.post('/favorites', (req, res, next) => {
    if ((Number.isInteger(req.body.bookId) === false)) {
        res.set('Content-Type', 'text/plain');
        return res.status(400).send('Book ID must be an integer');
    } else {
        jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
            if (err) {
                res.set('Content-type', 'text/plain');
                res.status(401).send('Unauthorized');
            } else {
                let newBook = {
                    book_id: req.body.bookId,
                    user_id: payload.userId
                }
                knex('books')
                    .where('id', req.body.bookId)
                    .then((bookidExist) => {
                        if (bookidExist[0] === undefined) {
                            res.set("Content-Type", "text/plain");
                            return res.status(404).send('Book not found');
                        } else {
                            knex('favorites').insert(newBook).returning('*')
                                .then((book) => {
                                    res.status(200);
                                    res.send(humps.camelizeKeys(book[0]));
                                })
                                .catch((err) => {
                                    console.error(err);
                                })
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    })
            }
        });
    }
})

router.delete('/favorites', (req, res, next) => {
    if ((Number.isInteger(req.body.bookId) === false)) {
        res.set('Content-Type', 'text/plain');
        return res.status(400).send('Book ID must be an integer');
    }
    jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            res.set('Content-type', 'text/plain');
            res.status(401).send('Unauthorized');
        } else {
            knex('books')
                .where('id', req.body.bookId)
                .then((bookidExist) => {
                    if (bookidExist[0] === undefined) {
                        res.set("Content-Type", "text/plain");
                        return res.status(404).send('Favorite not found');
                    } else {
                        knex('favorites').where('book_id', req.body.bookId).del().returning('*')
                            .then((deletedPortion) => {
                                let deletedValidBook = deletedPortion[0];
                                delete deletedValidBook.id
                                delete deletedValidBook.created_at
                                delete deletedValidBook.updated_at
                                res.status(200).json(humps.camelizeKeys(deletedValidBook));
                            })
                            .catch((err) => {
                                console.error(err);
                            })
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        }
    });
});
// YOUR CODE HERE
module.exports = router;
