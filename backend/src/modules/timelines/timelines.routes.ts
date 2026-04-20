import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { CreateTimelineSchema } from "./timelines.dto";
import * as timelinesController from "./timelines.controller";

const router = Router({ mergeParams: true }); // Để lấy được :id từ contract router

router.use(requireAuth);

router.get("/", timelinesController.getTimelines);
router.post("/", validate(CreateTimelineSchema), timelinesController.createTimeline);

export default router;
