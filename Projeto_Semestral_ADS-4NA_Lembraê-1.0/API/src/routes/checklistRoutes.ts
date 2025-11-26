import { Router } from "express";
import * as checklistController from "../controllers/checklistcontroller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();
router.use(authMiddleware);
router.post("/:lembreteId/items", checklistController.add);
router.put("/items/:id", checklistController.update);
router.delete("/items/:id", checklistController.remove);
export default router;