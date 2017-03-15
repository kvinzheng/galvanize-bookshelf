'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    bookId:
      Joi.number()
      .integer()
      .label('Integer')
      .required()
      // .trim()

  //   password: Joi.string()
  //     .label('Password')
  //     .required()
  //     .trim()
  //     .min(8)
  // }
  }
};
