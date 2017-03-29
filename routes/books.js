'use strict';

const express = require('express');
const humps = require('humps');
const router = express.Router();
const knex = require('../knex');

router.get('/books', (req, res, next) => {
    knex('books')
        .orderBy('title', 'asc')
        .then((manybooks) => {
            res.set('Content-Type', 'application/json')
            return res.send(humps.camelizeKeys(manybooks));
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/books/:id', (req, res, next) => {
    if(isNaN(req.params.id)) {
        res.status(404);
        res.set('Content-Type', 'text/plain');
        return res.send('Not Found');
    }

    // knex('books')
    //     .where({
    //         'id':req.params.id
    //     })
    //     .returning('*')
    //     .then((match) => {
    //         if (match === undefined) {
    //           console.log('9000 or -1');
    //           res.set('Content-Type', 'text/plain')
    //           return res.status(404).send('Not Found');
    //         }
    //     })

    knex('books')
        .orderBy('title', 'asc')
        .where('id', req.params.id)
        .then((onebook) => {
            if (!onebook[0]) {
              res.set('Content-Type', 'text/plain')
              return res.status(404).send('Not Found');
            }
            res.set('Content-Type', 'application/json')
            return res.send(humps.camelizeKeys(onebook[0]));
        })
        .catch((err) => {
            console.error(err);
        });
});

router.post('/books', (req, res, next) => {
    if(req.body.title === undefined){
      return res.status(400).set('Content-Type', 'text/plain')
      .send('Title must not be blank');
    }
    else if(req.body.author === undefined){
      res.status(400).set('Content-Type', 'text/plain')
      .send('Author must not be blank');
    }
    else if(req.body.genre === undefined){
      res.status(400).set('Content-Type', 'text/plain')
      .send('Genre must not be blank');
    }
    else if(req.body.description === undefined){
      res.status(400).set('Content-Type', 'text/plain')
      .send('Description must not be blank');
    }
    else if(req.body.coverUrl === undefined){
      res.status(400).set('Content-Type', 'text/plain')
      .send('Cover URL must not be blank');
    }
    else{
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
            }
            else{
            res.set('Content-Type', 'application/json')
            return res.send(humps.camelizeKeys(manybooks[0]));
            }
        })
        .catch((err) => {
            next(err);
        });
    }
});

router.patch('/books/:id', (req, res, next) => {
  if(isNaN(req.params.id)) {
      // console.log('it is not a number');
      res.status(404);
      res.set('Content-Type', 'text/plain');
      return res.send('Not Found');
  }

  // if (knex('books')
  //     .where({
  //         'id':req.params.id
  //     })
  //     .returning('*')
  //     .then((match) => {
  //         return match === undefined;
  //     })) {
  //     // console.log('9000 or -1');
  //     res.set('Content-Type', 'text/plain')
  //     return res.status(404).send('Not Found');
  // }

    knex('books')
        .where('id', req.params.id)
        .then((manybooks) => {
            if (!manybooks[0]) {
              res.set('Content-Type', 'text/plain')
              return res.status(404).send('Not Found');
            }
            else {
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
              // }
        .then((manybooks) => {
          // res.set('Content-Type', 'application/json')
          res.json(humps.camelizeKeys(manybooks[0]));
        })
        .catch((err) => {
            next(err);
        });
      // }
});

router.delete('/books/:id', (req, res, next) => {
  if(isNaN(req.params.id)) {
      res.status(404);
      res.set('Content-Type', 'text/plain');
      return res.send('Not Found');
  }
  // knex('books')
  //     .where({
  //         'id':req.params.id
  //     })
  //     .returning('*')
  //     .then((match) => {
  //       if(match[0]){
  //         console.log('what is match',match[0]);
  //         res.set('Content-Type', 'text/plain')
  //         return res.status(404).send('Not Found');
  //       }
  //     })
  else{

   knex('books')
        .where('id', req.params.id).returning('*')
        // .first()
        // .del()
        .then((deletedbook) => {

            if (!deletedbook[0]) {
              res.set('Content-Type', 'text/plain')
              return res.status(404).send('Not Found');
            }
            else{
              // console.log('i am here',deletedbook[0]);

                // delete deletedbook[0].id;
                // console.log('what is deletedbook[0]',deletedbook[0]);
                // res.set('Content-Type', 'application/json')
                // return res.send(humps.camelizeKeys(deletedbook1[0]));
                return knex('books')
                      .del()
                      .first()
                      .where('id', req.params.id).returning('*');
            }
            // return deletedbook;
        })
        .then((deletedbook1) => {
          if (!deletedbook1) {
            // res.set('Content-Type', 'text/plain')
            return res.status(404).send('Not Found');
          }
          else{
          // console.log('deletedbook1',deletedbook1);
            delete deletedbook1.id;
            // res.set('Content-Type', 'application/json')
          res.json(humps.camelizeKeys(deletedbook1));
          }
        })
        .catch((err) => {
            next(err); //what is next?
        });
      }
});

module.exports = router;
