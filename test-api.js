const fetch = require('node-fetch');
fetch('http://localhost:3000/api/proxy-image?url=https%3A%2F%2Fi.imgur.com%2FbIKVBEv.png')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
