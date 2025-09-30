// db.js (الكود الذي يجب استخدامه)
const { Pool } = require('pg');

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
    // 💡 الوضع المحلي (Local Development):
    if (!process.env.PG_USER) {
        // هذا الخطأ سيظهر فقط إذا كنت تشغل محلياً دون إعداد .env
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


// 🚨🚨🚨 تم حذف اختبار الاتصال (pool.query) بالكامل لضمان استقرار الخادم 🚨🚨🚨
// الاتصال سيتم اختباره عند أول طلب API فعلي.


module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};