import { createKoaLogger } from '@neodx/log/koa';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import Koa from 'koa';
import { usersRouter } from './routes';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = new Koa();
const logger = createLogger({
  name: 'koa-app'
});
const koaLogger = createKoaLogger({
  logger,
  simple: dev,
  shouldLogRequest: true
});

app.use(koaLogger);
app.use(async (ctx, next) => {
  await next();
  const status = ctx.status || 404;

  if (status === 404) {
    ctx.throw(createError(404));
  }
});
app.use(usersRouter.routes());

app.listen(port, () => {
  logger.success(`Example app listening on port ${port}!`);
});
