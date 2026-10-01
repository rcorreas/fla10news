const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fla10-f6f4b'
});
const db = admin.firestore();

db.collection('history').get().then(snapshot => {
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.content && data.content.includes('Zico')) {
        console.log(`\n\n--- ARTICLE: ${data.title} ---`);
        console.log(data.content);
    }
  });
}).catch(console.error);
