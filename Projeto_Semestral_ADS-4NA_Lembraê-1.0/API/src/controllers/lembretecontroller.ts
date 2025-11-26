import { Response } from "express";
import * as lembService from "../services/lembreteService";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppDataSource } from "../data-source";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const lembrete = await lembService.createLembrete(userId, req.body);
    return res.json(lembrete);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const listByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const lista = await lembService.listLembretes(userId);

    // Agora categorias já é array nativo
    const listaFormatada = lista.map(l => ({
      ...l,
      categorias: l.categorias || [], // não precisa de JSON.parse
      checklist: l.checklist || []
    }));

    return res.json(listaFormatada);
  } catch (err: any) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const lembrete = await lembService.getLembrete(userId, id);
    return res.json(lembrete);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const updated = await lembService.updateLembrete(userId, id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    await lembService.deleteLembrete(userId, id);
    return res.json({ message: "Lembrete deletado com sucesso" });
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const concluir = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);

    const updated = await lembService.updateLembrete(userId, id, {
      concluido: true
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const desconcluir = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);

    const updated = await lembService.updateLembrete(userId, id, {
      concluido: false
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = Number(req.params.itemId);
    const action = req.params.action; // check OR uncheck

    const repo = AppDataSource.getRepository("Checklist");

    const item = await repo.findOneBy({ id: itemId });
    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    item.checked = action === "check";

    const saved = await repo.save(item);

    return res.json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};