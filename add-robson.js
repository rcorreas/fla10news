require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  await addDoc(collection(db, "authors"), {
    name: "Robson Corrêa",
    slug: "robson-correa",
    image: "https://i.postimg.cc/L5LSvrxM/2511818.png",
    description: "Criador do Canal Fla Dez no YouTube e idealizador do portal FLA10 News. Apaixonado pelo Flamengo, dedica-se a trazer análises precisas, opiniões sinceras e notícias de primeira mão para a Nação Rubro-Negra.",
    createdAt: new Date(),
  });
  console.log("Robson added");
  process.exit(0);
}
main();
