// src/routes/userRoutes.ts
import { Router } from "express";
import { getUserById, updateUser, deleteUser } from "../services/userService";

const router = Router();

// ===============================
// 🔵 GET /user/:id  (buscar usuário)
// ===============================
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const user = await getUserById(id);

        return res.json(user);

    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

// ===============================
// 🟡 PUT /user/:id  (atualizar nome/email)
// ===============================
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = await updateUser(id, req.body);

        return res.json(result);

    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

// ===============================
// 🔴 DELETE /user/:id (deletar usuário)
// ===============================
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = await deleteUser(id);

        return res.json(result);

    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});


export default router;
