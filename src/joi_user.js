const joi = require('joi');

module.exports= joi.object().keys({
  username: joi.string().alphanum().min(3).max(30).error(new Error('username invalid')).required(),
  email: joi.string().email().error(new Error('email invalid')).required(),
  password: joi.string().error(new Error('password invalid')).regex(/^[a-zA-Z0-9]{3,30}$/)
})
