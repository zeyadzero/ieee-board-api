// authMiddleware.js (مُحدَّث)
const jwt = require('jsonwebtoken');

// 🚨 هذا السِر يجب أن يكون خاص بـ Access Token (الذي يتم إرساله مع كل طلب)
const JWT_SECRET = process.env.JWT_SECRET; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // الصيغة المتوقعة: "Bearer ACCESS_TOKEN_STRING"
    const token = authHeader && authHeader.split(' ')[1]; 
    
    // 1. التحقق من وجود التوكن
    if (token == null) {
        // نستخدم 401 لأن التوكن لم يُرسل
        return res.status(401).json({ message: 'Authentication Access Token is required.' });
    }

    // 2. التحقق من صلاحية التوكن (Verifying the Access Token)
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // نستخدم 403 لأن التوكن موجود لكنه منتهي (وهنا الواجهة الأمامية ستحاول التجديد)
            console.log('Access Token Verification Failed:', err.message);
            return res.status(403).json({ message: 'Access Token is invalid or expired.' });
        }
        
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken
};