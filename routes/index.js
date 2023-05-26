import { Router } from "express";
import AppController from "../controllers/AppController";
const indexRoute = Router();

indexRoute.get("/status", AppController.getStatus);
indexRoute.get("/stats", AppController.getStats);

export default indexRoute;
