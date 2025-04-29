const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 25000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Serve sprites running on http://localhost:${port}`);
});
