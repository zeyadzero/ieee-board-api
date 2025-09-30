// boardController.js

// جلب بيانات جميع المجالس (Officers, Technical, Branding, Operation)
const getBoardData = async () => {
    // نحدد الأعمدة التي نحتاجها
    const queryText = `
        SELECT id, name, position, image_url AS image, bio, linkedin_url AS linkedin, board_type
        FROM members
        WHERE board_type IN ('officers', 'technical', 'branding', 'operation')
        ORDER BY id;
    `;
    
    try {
        const { rows } = await db.query(queryText);
        
        // *تجميع البيانات في الصيغة المطلوبة للواجهة الأمامية*
        const structuredData = {
            officers: rows.filter(member => member.board_type === 'officers'),
            technical: rows.filter(member => member.board_type === 'technical'),
            branding: rows.filter(member => member.board_type === 'branding'),
            operation: rows.filter(member => member.board_type === 'operation'),
        };
        
        // إزالة الحقل board_type من الكائنات المرسلة لـ React
        // (خطوة تنظيف اختيارية)
        Object.keys(structuredData).forEach(key => {
            structuredData[key] = structuredData[key].map(({ board_type, ...rest }) => rest);
        });
        
        return structuredData;
        
    } catch (err) {
        console.error("Database query error in getBoardData:", err);
        throw new Error("Failed to retrieve board data from database.");
    }
};

// جلب بيانات الرئيس السابق
const getLastChairman = async () => {
    const queryText = `
        SELECT id, name, position, image_url AS image, bio, linkedin_url AS linkedin
        FROM members
        WHERE board_type = 'last-chairman'
        LIMIT 1;
    `;
    
    try {
        const { rows } = await db.query(queryText);
        // نُعيد الكائن الأول (الرئيس السابق) أو كائن فارغ إذا لم يُعثر عليه
        return rows[0] || {};
    } catch (err) {
        console.error("Database query error in getLastChairman:", err);
        throw new Error("Failed to retrieve last chairman data.");
    }
};

module.exports = {
    getBoardData,
    getLastChairman
};