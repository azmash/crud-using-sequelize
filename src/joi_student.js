const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const joi = BaseJoi.extend(Extension);

module.exports= joi.object().keys({
  name: joi.string().regex(/^[a-z][a-z\s]*$/ig).min(2).max(30).error(new Error('Input Name invalid')).required(),
  email: joi.string().email().error(new Error('Email invalid')).required(),
  dob: joi.date().format('YYYY-MM-DD').error(new Error('Date of Birth invalid')).required(),
  age: joi.number().integer().min(18).error(new Error('Age at least 18')).required()
})
