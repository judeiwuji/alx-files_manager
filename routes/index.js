import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FileController from '../controllers/FilesController';

const indexRoute = Router();
indexRoute.get('/status', AppController.getStatus);
indexRoute.get('/stats', AppController.getStats);
indexRoute.post('/users', UsersController.postNew);
indexRoute.get('/connect', AuthController.getConnect);
indexRoute.get('/disconnect', AuthController.getDisconnect);
indexRoute.get('/users/me', UsersController.getMe);
indexRoute.post('/files', FileController.postUpload);
export default indexRoute;
