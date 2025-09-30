// db.js (الكود النهائي للنشر)
const { Pool } = require('pg');

// Railway يوفر هذا المتغير تلقائيًا بعد الربط
const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
    // 💡 وضع الإنتاج (Production): يستخدم سلسلة DATABASE_URL من Railway
    pool = new Pool({
        connectionString: connectionString,
        ssl: {
            // ضروري للاتصال بقاعدة بيانات سحابية
            rejectUnauthorized: false
        }
    });
    console.log('✅ PostgreSQL Pool initialized using DATABASE_URL (Production mode).');
} else {
    // 💡 الوضع المحلي (Local Development): يستخدم الإعدادات المنفصلة من ملف .env
    // هذا الجزء سيعمل فقط إذا كنت تشغل الخادم محليًا
    if (!process.env.PG_USER) {
        throw new Error("❌ DATABASE_URL is missing, and local PG_USER is not defined. Cannot connect.");
    }

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