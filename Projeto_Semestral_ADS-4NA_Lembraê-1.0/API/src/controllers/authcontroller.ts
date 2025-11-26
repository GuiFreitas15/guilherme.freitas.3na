import { Request, Response } from "express";
import * as authService from "../services/authService";


export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, data_nascimento, palavra_chave } = req.body;

    const result = await authService.register(
      name,
      email,
      password,
      data_nascimento,
      palavra_chave
    );

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};