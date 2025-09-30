// server.js (الكود المبسط للوصول العام)
require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); // 🚨 الآن CORS أصبح شاملاً
const helmet = require('helmet');
// تم إزالة jwt لأننا لن نستخدمه
const boardController = require('./boardController'); 
// تم إزالة authenticateToken لأننا لن نستخدمه
require('./db'); 

const app = express();

const PORT = process.env.PORT || 5000; 

// ----------------------------------------------------
// 1. الأمان والـ MIDDLEWARES (المبسط)
// ----------------------------------------------------
app.use(helmet()); 

// 🚨 الحل الأقصى لـ CORS: السماح للجميع بالوصول
app.use(cors()); 

app.use(express.json()); // لتحليل JSON


// ----------------------------------------------------
// 2. مسارات الـ API (عامة ومباشرة)
// ----------------------------------------------------

// 1. مسار جلب جميع المجالس (عام)
app.get('/api/board', async (req, res) => {
    try {
        const data = await boardController.getBoardData();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/board:", err.message);
        res.status(500).json({ message: "Internal server error while fetching board data." });
    }
});

// 2. مسار جلب الرئيس السابق (عام)
app.get('/api/last-chairman', async (req, res) => {
    try {
        const data = await boardController.getLastChairman();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/last-chairman:", err.message);
        res.status(500).json({ message: "Internal server error while fetching last chairman data." });
    }
});


// ----------------------------------------------------
// 3. معالجة الأخطاء (404) في النهاية
// ----------------------------------------------------
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint not found." });
});


// ----------------------------------------------------
// بدء تشغيل الخادم
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
});