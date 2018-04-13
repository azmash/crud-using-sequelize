const Sequelize = require ('sequelize');
const sequelize = require('../src/seq_con');

sequelize.authenticate()
.then(() => {
  console.log('conn success');
})
.catch(() => {
  console.error('conn error',err);
})

const student = sequelize.define('student', {
  id_student: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull:false
  },
  name: Sequelize.STRING,
  address: Sequelize.STRING,
  gender: Sequelize.ENUM('f','m'),
  dob: Sequelize.DATE,
  adm_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  email: Sequelize.STRING
})

module.exports = student;