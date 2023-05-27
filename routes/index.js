import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const indexRoute = Router();
indexRoute.get('/status', AppController.getStatus);
indexRoute.get('/stats', AppController.getStats);
indexRoute.post('/users', UsersController.postNew);
indexRoute.get('/connect', AppController.getConnect);
indexRoute.get('/disconnect', AppController.getDisconnect);
indexRoute.get('/users/me', UsersController.me);
export default indexRoute;
