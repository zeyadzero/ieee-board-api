// boardController.js (الكود الذي يضمن جلب جميع الرؤساء السابقين)
const db = require('./db');

// ✅ جلب بيانات كل المجالس (Officers, Technical, Branding, Operation)
const getBoardData = async () => {
    const queryText = `
        SELECT id, name, position, image_url AS image, bio, linkedin_url AS linkedin, board_type
        FROM members
        WHERE board_type IN ('officers', 'technical', 'branding', 'operation')
        ORDER BY id;
    `;

    try {
        const { rows } = await db.query(queryText);
        
        // تجميع البيانات في الهيكل المطلوب للواجهة الأمامية
        const structuredData = {
            officers: rows.filter(member => member.board_type === 'officers'),
            technical: rows.filter(member => member.board_type === 'technical'),
            branding: rows.filter(member => member.board_type === 'branding'),
            operation: rows.filter(member => member.board_type === 'operation'),
        };

        // تنظيف: إزالة حقل board_type من الكائنات المرسلة
        Object.keys(structuredData).forEach(key => {
            structuredData[key] = structuredData[key].map(({ board_type, ...rest }) => rest);
        });

        return structuredData;
    } catch (err) {
        console.error("Database query error in getBoardData:", err);
        throw new Error("Failed to retrieve board data.");
    }
};

// ✅ جلب بيانات جميع الرؤساء السابقين (Last Chairmen)
const getLastChairman = async () => {
    const queryText = `
        SELECT id, name, position, image_url AS image, bio, linkedin_url AS linkedin
        FROM members
        WHERE board_type = 'last-chair'
        ORDER BY id DESC;
    `;

    try {
        const { rows } = await db.query(queryText);
        // 🚨 التصحيح: نُعيد المصفوفة الكاملة (rows) لكي يتم عرض جميع الأعضاء
        return rows; 
    } catch (err) {
        console.error("Database query error in getLastChairman:", err);
        throw new Error("Failed to retrieve all last chairmen data.");
    }
};

module.exports = {
    getBoardData,
    getLastChairman,
};