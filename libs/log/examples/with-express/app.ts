import express from 'express';
import { createExpressLogger } from '../../src/express';

const app = express();
const expressLogger = createExpressLogger({
  shouldLogRequest: false,
  simple: true
});

app.use(expressLogger);
app.get('/kek', (req, res) => {
  setTimeout(() => {
    res.send('Hello World!');
  }, 70);
});

app.get('/foo/bar/baz', (req, res, next) => {
  next(new Error('kek'));
});

app.use(expressLogger.preserveErrorMiddleware);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
