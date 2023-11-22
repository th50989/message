const admin = require('firebase-admin');

// Replace the following with your own service account key JSON
const serviceAccount = require('../pushnotidoanttlta-firebase-adminsdk-g142s-6999441e02.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://console.firebase.google.com/project/pushnotidoanttlta/firestore/data/~2FMessages~2FT3JbS5Sxi8Iu5m4tVNNt', // Replace with your Firebase project URL
});

const db = admin.firestore();

module.exports = { db,admin };
