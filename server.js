// server.js (جاهز للنشر على Railway)
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken'); 
const boardController = require('./boardController'); 
const { authenticateToken } = require('./authMiddleware'); 
const { pool } = require('./db'); // 💡 يفترض أن db.js يقوم بتصدير الـ pool

const app = express();

// Railway سيحدد المنفذ تلقائيًا
const PORT = process.env.PORT || 5000; 
const FRONTEND_URL = process.env.FRONTEND_URL; 
const API_GATEWAY_PASS = process.env.API_GATEWAY_PASS; 
const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; 
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1m'; 
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '3m'; 

// ----------------------------------------------------
// 1. الأمان والـ MIDDLEWARES (يجب أن تكون في الأعلى)
// ----------------------------------------------------
app.use(helmet()); 

const corsOptions = {
    origin: FRONTEND_URL, 
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); 

app.use(express.json()); // لتحليل JSON من طلبات POST


// ----------------------------------------------------
// 2. مسارات المصادقة (توليد وتجديد التوكن)
// ----------------------------------------------------

// أ. مسار توليد التوكنين (Auth)
app.post('/api/auth', (req, res) => {
    if (!req.body.password || req.body.password !== API_GATEWAY_PASS) {
        return res.status(401).json({ message: "Invalid credentials or password not provided." });
    }
    
    // حمولة التوكن
    const payload = { id: 'board-member', role: 'viewer' }; 

    // 1. توليد Access Token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    // 2. توليد Refresh Token (نفترض أنه تم حفظه في مكان آمن في الإنتاج)
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // 💡 ملاحظة: في هذا الوضع، يتم إرسال التوكنين دون حفظ Refresh Token في DB.

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});


// ب. مسار تجديد التوكن (Refresh Endpoint)
app.post('/api/refresh', (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken == null) return res.status(401).json({ message: 'Refresh Token is missing.' });
    
    // 💡 ملاحظة: لا يوجد تحقق من الـ DB/القائمة الوهمية، نعتمد على صلاحية الـ JWT فقط
    
    // التحقق من صلاحية الـ Refresh Token باستخدام السِر الخاص به
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Refresh Token expired or invalid.' });
        }
        
        // توليد Access Token جديد فقط
        const newAccessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        
        res.json({ accessToken: newAccessToken });
    });
});


// ----------------------------------------------------
// 3. مسارات الـ API المحمية (تستخدم Access Token)
// ----------------------------------------------------

// 1. مسار جلب جميع المجالس (محمي)
app.get('/api/board', authenticateToken, async (req, res) => {
    try {
        const data = await boardController.getBoardData();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/board:", err.message);
        res.status(500).json({ message: "Internal server error while fetching board data." });
    }
});

// 2. مسار جلب الرئيس السابق (محمي)
app.get('/api/last-chairman', authenticateToken, async (req, res) => {
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
app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
    console.log(`✅ Allowed frontend URL: ${FRONTEND_URL}`);
});