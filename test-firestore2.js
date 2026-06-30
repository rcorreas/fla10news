import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, where } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const q = query(collection(db, "columns"), where("title", "==", "A Cronica da Nação"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    console.log("FOUND:", doc.id, doc.data().slug, doc.data().columnImage, doc.data().authorImage);
  });
  if (snapshot.empty) console.log("Not found.");
  process.exit(0);
}
main();
