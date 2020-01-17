var mySql = require('mysql');
var config = require('../config/database');

const mySqlCon = mySql.createConnection({
    host: config.connection.host,
    user: config.connection.user,
    password: config.connection.password,
    database: config.database,
    multipleStatements: config.connection.multipleStatements
})

mySqlCon.connect((err)=>{
    if(!err)
        console.log('DataBase Connected');
    else
        console.log('DataBase Connection Failed ',  err);
})

module.exports = mySqlCon;