const Sequelize = require ('sequelize');

const sequelize = new Sequelize('stu', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  define: {
    freezeTableName: true,
    timestamps: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
})

module.exports=sequelize;