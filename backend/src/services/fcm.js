const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    try {
        const credentialsString = process.env.FIREBASE_CREDENTIALS;

        if (!credentialsString) {
            throw new Error("FIREBASE_CREDENTIALS not found environment variables");
        }

        const serviceAccount = JSON.parse(credentialsString);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("Firebase successfully initialized!");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
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