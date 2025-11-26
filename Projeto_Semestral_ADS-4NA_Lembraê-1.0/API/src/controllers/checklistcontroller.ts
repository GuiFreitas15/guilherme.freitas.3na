import { Request, Response } from "express";
import * as checklistService from "../services/checklistServise";

export const add = async (req: Request, res: Response) => {
  try {
    const lembreteId = Number(req.params.lembreteId);
    const item = await checklistService.addItem(lembreteId, req.body);
    return res.status(201).json(item);
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Erro interno" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await checklistService.updateItem(id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Erro interno" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await checklistService.deleteItem(id);
    return res.status(204).send();
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Erro interno" });
  }
};
