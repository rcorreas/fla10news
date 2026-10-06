import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDiEsBJO3u9-u90_UC6BsOmxIXEpIjQu0k",
  authDomain: "fla10-f6f4b.firebaseapp.com",
  projectId: "fla10-f6f4b",
  storageBucket: "fla10-f6f4b.firebasestorage.app",
  messagingSenderId: "599071547068",
  appId: "1:599071547068:web:777570cafbe1a5060ffab9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, "videos"), orderBy("publishedAt", "desc"), limit(2));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => console.log(doc.id, doc.data().title, doc.data().videoUrl));
}
check();
