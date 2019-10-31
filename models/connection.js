var mySql = require('mysql');

const mySqlCon = mySql.createConnection({
    host:'212.71.250.201',
    user:'a572016d_ShyamMusicUser',
    password:'shyam@123',
    database:'a572016d_ShyamMusicStreaming',
    multipleStatements:true
})

mySqlCon.connect((err)=>{
    if(!err)
        console.log('DataBase Connected');
    else
        console.log('DataBase Connection Failed');
})

module.exports = mySqlCon;