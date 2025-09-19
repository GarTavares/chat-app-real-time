const admin = require('firebase-admin');
const serviceAccount = require("./firebaseConfig.json");~


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "rede-social-tcc.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


module.exports = { db, admin, bucket};