const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "fla10news-prod-2026",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const q = query(collection(db, "authors"));
  const snapshot = await getDocs(q);
  console.log("Authors:");
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().name);
  });
  process.exit(0);
}
main();
