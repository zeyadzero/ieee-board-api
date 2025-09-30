require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken'); 
const path = require('path');

const boardController = require('./boardController'); 
const { authenticateToken } = require('./authMiddleware'); 
require('./db'); // تشغيل الاتصال بقاعدة البيانات

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
app.use(express.json()); 


// ----------------------------------------------------
// 2. مسارات المصادقة (Auth و Refresh)
// ----------------------------------------------------
app.post('/api/auth', (req, res) => {
    if (!req.body.password || req.body.password !== API_GATEWAY_PASS) {
        return res.status(401).json({ message: "Invalid credentials or password not provided." });
    }

    const payload = { userId: 1, role: 'board_viewer' }; 

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.json({ accessToken, refreshToken });
});

app.post('/api/refresh', (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh Token is missing.' });
    
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Refresh Token expired or invalid.' });
        }
        
        const newAccessToken = jwt.sign(
            { userId: user.userId, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: TOKEN_EXPIRY }
        );
        
        res.json({ accessToken: newAccessToken });
    });
});


// ----------------------------------------------------
// 3. مسارات الـ API المحمية
// ----------------------------------------------------
app.get('/api/board', authenticateToken, async (req, res) => {
    try {
        const data = await boardController.getBoardData();
        res.json(data);
    } catch (err) {
        console.error("Error in /api/board:", err.message);
        res.status(500).json({ message: "Internal server error while fetching board data." });
    }
});

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
// 4. Fallback Routes (بدون * أو /*)
// ----------------------------------------------------

// 📌 للـ API 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: "API endpoint not found." });
});

