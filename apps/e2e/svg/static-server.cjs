const express = require('express');
const path = require('path');

const app = express();

const port = process.env.PORT || 25000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
  console.log(`Serve sprites running on http://localhost:${port}`);
});
