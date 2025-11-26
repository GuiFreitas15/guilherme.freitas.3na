import { Router } from "express";
import { RecoveryController } from "../controllers/recoveryController";

const router = Router();

router.post("/verify", RecoveryController.verifyUser);
router.post("/reset", RecoveryController.resetPassword);

export default router;