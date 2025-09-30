// server.js (الكود النهائي بعد حذف الحماية)
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken'); 
const boardController = require('./boardController'); 
// 🚨🚨🚨 تم حذف سطر استيراد authenticateToken 🚨🚨🚨
require('./db'); 

const app = express();

const PORT = process.env.PORT || 5000; 
const API_GATEWAY_PASS = process.env.API_GATEWAY_PASS; 
const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; 
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d'; 
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; 

// ----------------------------------------------------
// 1. الأمان والـ MIDDLEWARES
// ----------------------------------------------------
app.use(helmet()); 

// قائمة العناوين المسموح بها (حل نهائي لمشكلة Firebase CORS)
const allowedOrigins = [
    'https://ieee-al-azhar-university.web.app', 
    'https://ieee-al-azhar-university.firebaseapp.com',
    'http://localhost:5173' 
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy. Origin rejected.'), false);
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); 
app.use(express.json()); // لتحليل JSON


// ----------------------------------------------------
// 2. مسارات المصادقة (Auth و Refresh) - لم تعد مستخدمة في Frontend
// ----------------------------------------------------
app.post('/api/auth', (req, res) => {
    // ... (منطق توليد التوكن) ...
    res.status(503).json({ message: "Authentication is temporarily disabled." }); 
});
app.post('/api/refresh', (req, res) => {
    res.status(503).json({ message: "Authentication is temporarily disabled." });
});


// ----------------------------------------------------
// 3. مسارات الـ API العامة (بدون حماية)
// ----------------------------------------------------

// 1. مسار جلب جميع المجالس (عام)
app.get('/api/board', async (req, res) => { // 🚨 تم حذف authenticateToken
    try {
        const data = await boardController.getBoardData();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/board:", err.message);
        res.status(500).json({ message: "Internal server error while fetching board data." });
    }
});

// 2. مسار جلب الرئيس السابق (عام)
app.get('/api/last-chairman', async (req, res) => { // 🚨 تم حذف authenticateToken
    try {
        const data = await boardController.getLastChairman();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/last-chairman:", err.message);
        res.status(500).json({ message: "Internal server error while fetching last chairman data." });
    }
});


// ----------------------------------------------------
// 4. معالجة الأخطاء (404) في النهاية
// ----------------------------------------------------
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint not found." });
});


// ----------------------------------------------------
// بدء تشغيل الخادم
// ----------------------------------------------------
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`✅ API Server running on port ${PORT}`);
});