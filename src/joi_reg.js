const joi = require('joi');

module.exports= joi.object().keys({
  password: joi.string().error(new Error('password invalid')).regex(/^[a-zA-Z0-9]{3,30}$/).required()
})