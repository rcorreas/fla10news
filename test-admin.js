const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'fla10-f6f4b'
});
const db = admin.firestore();
db.collection('test').limit(1).get()
  .then(() => console.log('Admin SDK works'))
  .catch(e => console.error('Admin SDK failed:', e.message));
