const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',       
    password: '123',        
    host: 'localhost',      
    port: 5432,             
    database: 'reyleon',    
    ssl: false              
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};
