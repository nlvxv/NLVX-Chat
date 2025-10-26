const Ably = require('ably');

module.exports = async (req, res) => {
    // السماح بـ CORS من أي مكان
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // السماح فقط بـ POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // الحصول على البيانات من الطلب
        const { userId, username } = req.body;

        // التحقق من البيانات
        if (!userId || !username) {
            return res.status(400).json({ error: 'Missing userId or username' });
        }

        // إنشاء Ably client باستخدام API key من Environment Variables
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);

        // إعدادات الـ Token
        const tokenParams = {
            clientId: userId,
            capability: {
                'chat:*': ['publish', 'subscribe', 'presence'],
                'global-presence': ['publish', 'subscribe', 'presence']
            },
            ttl: 3600000 // صلاحية ساعة واحدة
        };

        // إنشاء Token Request
        const tokenRequest = await ably.auth.createTokenRequest(tokenParams);
        
        // إرسال Token للمستخدم
        res.status(200).json(tokenRequest);
    } catch (error) {
        console.error('Token creation error:', error);
        res.status(500).json({ error: 'Failed to create token' });
    }
};