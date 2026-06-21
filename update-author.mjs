import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  let found = false;

  // Try news
  const newsSnapshot = await getDocs(collection(db, "news"));
  for (const docSnapshot of newsSnapshot.docs) {
    const data = docSnapshot.data();
    if (data.title && data.title.includes("Liga das Nações de Vôlei")) {
      console.log(`Found in news: ${docSnapshot.id} - ${data.title}`);
      await updateDoc(doc(db, "news", docSnapshot.id), {
        author: "Hélio Pacheco"
      });
      console.log("Updated author in news.");
      found = true;
    }
  }

  // Try colunas
  const colunasSnapshot = await getDocs(collection(db, "columns"));
  for (const docSnapshot of colunasSnapshot.docs) {
    const data = docSnapshot.data();
    if (data.title && data.title.includes("Liga das Nações de Vôlei")) {
      console.log(`Found in columns: ${docSnapshot.id} - ${data.title}`);
      const authorsSnapshot = await getDocs(collection(db, "authors"));
      let helioImage = "";
      let helioLink = "";
      let helioDesc = "";
      for (const aDoc of authorsSnapshot.docs) {
        if (aDoc.data().name === "Hélio Pacheco" || aDoc.data().name.includes("Hélio")) {
          helioImage = aDoc.data().image || "";
          helioLink = aDoc.data().link || "";
          helioDesc = aDoc.data().description || "";
        }
      }

      const updateData = { author: "Hélio Pacheco" };
      if (helioImage) updateData.authorImage = helioImage;
      if (helioLink) updateData.authorLink = helioLink;
      if (helioDesc) updateData.authorDescription = helioDesc;

      await updateDoc(doc(db, "columns", docSnapshot.id), updateData);
      console.log("Updated author in columns.");
      found = true;
    }
  }

  if (!found) {
    console.log("Article not found.");
  }
  process.exit(0);
}

main().catch(console.error);
