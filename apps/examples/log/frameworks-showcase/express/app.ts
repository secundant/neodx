import { createExpressLogger } from '@neodx/log/express';
import { createLogger } from '@neodx/log/node';
import express from 'express';
import createError from 'http-errors';
import { usersRouter } from './routes';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = express();
const logger = createLogger({
  name: 'my-app'
});
const expressLogger = createExpressLogger({
  logger,
  simple: dev,
  shouldLogRequest: true
});

app.set('port', port);

app.use(expressLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

app.use((req, res, next) => {
  next(createError(404));
});
app.use(expressLogger.preserveErrorMiddleware);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

process.on('uncaughtException', err => {
  logger.error(err, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', err => {
  logger.error(err, 'Unhandled rejection');
  process.exit(1);
});
app.listen(port, () => {
  logger.success(`Example app listening on port ${port}!`);
});
