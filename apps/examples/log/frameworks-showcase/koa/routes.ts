import '@neodx/log/koa'; // type definitions
import Router from 'koa-router';

export const usersRouter = new Router({
  prefix: '/users'
});

usersRouter.get('/', ctx => {
  ctx.body = 'respond with a resource';
});

usersRouter.get('/:id', ctx => {
  ctx.req.log.info('Requested user ID %s', ctx.params.id);
  ctx.status = 200;
  ctx.body = { id: ctx.params.id };
});
