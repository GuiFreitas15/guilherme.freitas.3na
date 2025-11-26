import { Request, Response } from "express";
import { CategoriaService } from "../services/categoriaService";

export class CategoriaController {
  static async criar(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const { nome, descricao } = req.body;

      const categoria = await CategoriaService.criarCategoria(userId, nome, descricao);
      res.status(201).json(categoria);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const categorias = await CategoriaService.listarCategoriasPorUsuario(userId);
      res.json(categorias);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async editar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = Number(req.params.userId);
      const { nome, descricao } = req.body;

      const categoria = await CategoriaService.editarCategoria(id, userId, nome, descricao);
      res.json(categoria);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deletar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = Number(req.params.userId);

      await CategoriaService.deletarCategoria(id, userId);
      res.json({ message: "Categoria excluída com sucesso" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
