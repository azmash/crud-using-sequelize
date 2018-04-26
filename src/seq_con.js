const Sequelize = require ('sequelize');
const conn = require('../conf/config');

const sequelize = new Sequelize(conn.db.database, conn.db.user, conn.db.password, {
  host: conn.db.host,
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