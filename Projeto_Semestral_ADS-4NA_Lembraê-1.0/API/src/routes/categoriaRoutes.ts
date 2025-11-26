import { Router } from "express";
import { CategoriaController } from "../controllers/categoriacontroller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Todas as rotas protegidas por JWT
router.use(authMiddleware);

// Criar categoria
router.post("/criar/:userId", CategoriaController.criar);

// Listar categorias de um usuário
router.get("/usuario/:userId", CategoriaController.listar);

// Editar categoria
router.put("/editar/:id/:userId", CategoriaController.editar);

// Deletar categoria
router.delete("/deletar/:id/:userId", CategoriaController.deletar);

export default router;
