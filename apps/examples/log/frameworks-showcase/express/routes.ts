import '@neodx/log/express'; // type definitions
import express from 'express';

export const usersRouter = express.Router();

usersRouter.get('/', (req, res) => {
  res.send('respond with a resource');
});

usersRouter.get('/:id', (req, res) => {
  req.log.info('Requested user ID %s', req.params.id);
  res.status(200).json({ id: req.params.id });
});
