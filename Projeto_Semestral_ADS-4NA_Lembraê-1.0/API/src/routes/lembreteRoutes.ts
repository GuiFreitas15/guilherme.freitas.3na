import { Router } from "express";
import * as lembController from "../controllers/lembretecontroller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

// Criar lembrete (POST /lembretes/criar/:userId)
router.post("/criar/:userId", lembController.create);

// Listar lembretes do usuário (GET /lembretes/usuario/:userId)
router.get("/usuario/:userId", lembController.listByUser);

// Buscar 1 lembrete (GET /lembretes/:id)
router.get("/:id", lembController.getOne);

// Editar lembrete (PUT /lembretes/editar/:id)
router.put("/editar/:id", lembController.update);

// Excluir lembrete (DELETE /lembretes/deletar/:id)
router.delete("/deletar/:id", lembController.remove);

// Marcar como concluído (PUT /lembretes/concluir/:id)
router.put("/concluir/:id", lembController.concluir);

// Desmarcar concluído (PUT /lembretes/desconcluir/:id)
router.put("/desconcluir/:id", lembController.desconcluir);

// Atualizar item do checklist (PUT /lembretes/checklist/:itemId/check)
router.put("/checklist/:itemId/:action", lembController.updateChecklistItem);

export default router;