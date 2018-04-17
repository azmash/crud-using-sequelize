const Sequelize = require ('sequelize');
const sequelize = require('../src/seq_con');


const users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull:false
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  pw_token: Sequelize.STRING,
  pw_exp: Sequelize.DATE,
  reg_token: Sequelize.STRING,
  status: Sequelize.STRING,
  secretkey: Sequelize.STRING,
  two_fa: Sequelize.ENUM('enable','disable'),
  url_qr: Sequelize.STRING
})

module.exports = users;