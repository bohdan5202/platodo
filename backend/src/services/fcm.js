const admin = require('firebase-admin');
const path = require('path');

// Вказуємо шлях до твого JSON-файлу
const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

// Ініціалізуємо Firebase лише один раз
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function sendPush(fcmToken, title, body) {
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: fcmToken
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return 200;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

module.exports = { sendPush };