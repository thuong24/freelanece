import { Router } from "express";
import * as discoveryController from "./discovery.controller";

const router = Router();

router.get("/home", discoveryController.getHomeData);

export default router;
