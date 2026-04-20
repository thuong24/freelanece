import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { SubmitMilestoneSchema } from "./milestones.dto";
import * as milestonesController from "./milestones.controller";

const router = Router();

router.use(requireAuth);

router.post("/", milestonesController.createMilestones);
router.post("/:id/submit", validate(SubmitMilestoneSchema), milestonesController.submitMilestone);
router.post("/:id/approve", milestonesController.approveMilestone);

export default router;
