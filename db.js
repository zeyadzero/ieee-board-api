// db.js (الكود الذي يجب استخدامه)
const { Pool } = require('pg');

// Railway وخدمات الإنتاج الأخرى توفر هذا المتغير
const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
    // 💡 وضع الإنتاج (Production): يستخدم سلسلة DATABASE_URL
    pool = new Pool({
        connectionString: connectionString,
        ssl: {
            // ضروري للاتصال بقاعدة بيانات سحابية (Railway)
            rejectUnauthorized: false 
        }
    });
    console.log('✅ PostgreSQL Pool initialized using DATABASE_URL (Production mode).');
} else {
    // 💡 الوضع المحلي (Local Development): يستخدم الإعدادات المنفصلة من ملف .env
    pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
        ssl: false // لا حاجة لـ SSL محلياً
    });
    console.log('✅ PostgreSQL Pool initialized using local environment variables.');
}


// اختبار الاتصال
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL successfully at:', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};