'use strict';

const express = require('express');
const humps = require('humps');
const router = express.Router();
const knex = require('../knex');

router.get('/books', (req, res, next) => {
    knex('books')
        .orderBy('title', 'asc')
        .then((manybooks) => {
            // res.set('Content-Type', 'application/json')
            return res.json(humps.camelizeKeys(manybooks));
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.status(404);
        res.set('Content-Type', 'text/plain');
        return res.send('Not Found');
    } else {
        knex('books')
            .orderBy('title', 'asc')
            .where('id', req.params.id)
            .then((onebook) => {
                if (!onebook[0]) {
                    res.set('Content-Type', 'text/plain')
                    return res.status(404).send('Not Found');
                }
                // res.set('Content-Type', 'application/json')
                return res.json(humps.camelizeKeys(onebook[0]));
            })
            .catch((err) => {
                next(err);
            });
    }
});

router.post('/books', (req, res, next) => {
    if (req.body.title === undefined) {
        return res.status(400).set('Content-Type', 'text/plain')
            .send('Title must not be blank');
    } else if (req.body.author === undefined) {
        res.status(400).set('Content-Type', 'text/plain')
            .send('Author must not be blank');
    } else if (req.body.genre === undefined) {
        res.status(400).set('Content-Type', 'text/plain')
            .send('Genre must not be blank');
    } else if (req.body.description === undefined) {
        res.status(400).set('Content-Type', 'text/plain')
            .send('Description must not be blank');
    } else if (req.body.coverUrl === undefined) {
        res.status(400).set('Content-Type', 'text/plain')
            .send('Cover URL must not be blank');
    } else {
        knex('books')
            .insert({
                id: req.body.id,
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                description: req.body.description,
                cover_url: req.body.coverUrl,
                created_at: req.body.created_at,
                updated_at: req.body.created_at
            }, '*')
            .then((manybooks) => {
                if (!manybooks) {
                    return next();
                } else {
                    // res.set('Content-Type', 'application/json')
                    return res.json(humps.camelizeKeys(manybooks[0]));
                }
            })
            .catch((err) => {
                next(err);
            });
    }
});

router.patch('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.status(404);
        res.set('Content-Type', 'text/plain');
        return res.send('Not Found');
    } else {

        knex('books')
            .where('id', req.params.id)
            .then((manybooks) => {
                if (!manybooks[0]) {
                    res.set('Content-Type', 'text/plain')
                    return res.status(404).send('Not Found');
                } else {
                    return knex('books')
                        .update({
                            id: req.body.id,
                            title: req.body.title,
                            author: req.body.author,
                            genre: req.body.genre,
                            description: req.body.description,
                            cover_url: req.body.coverUrl
                        })
                        .returning('*')
                        .where('id', req.params.id)
                }
            })
            .then((manybooks) => {
              res.json(humps.camelizeKeys(manybooks[0]));
            })
            .catch((err) => {
                next(err);
            });
    }
});

router.delete('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.set('Content-type', 'text/plain');
        res.status(404).send('Not Found');
    } else {
        let book;
        knex('books')
              .where('id', req.params.id)
              .first()
              .then((row) => {
                if (!row) {
                    res.set('Content-Type', 'text/plain')
                    res.status(404).send('Not Found');
                } else {
                    book = row;
                    return knex('books')
                        .del()
                        .where('id', req.params.id);
                }
            })
            .then(() => {
              // if( !book){
              // return res.status(404).send('Not Found');
              // }
              // else{
              if(book){
              delete book.id;
               res.json(humps.camelizeKeys(book));
              }
              // }
            })
            .catch((err) => {
                next(err); //what is next?
            });
    }
});

module.exports = router;
