import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
const indexRoute = Router();

indexRoute.get('/status', AppController.getStatus);
indexRoute.get('/stats', AppController.getStats);
indexRoute.post('/users', UsersController.postNew);

export default indexRoute;
