const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
// Since node fetch is available, let's just query firestore rest API
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fla10news-prod-2026";
fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/columns`)
  .then(res => res.json())
  .then(data => {
    const authors = data.documents.map(d => d.fields.author.stringValue);
    console.log([...new Set(authors)]);
  });
