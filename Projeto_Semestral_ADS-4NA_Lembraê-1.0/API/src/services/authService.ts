// src/services/authService.ts
import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (
  name: string,
  email: string,
  password: string,
  data_nascimento: string,
  palavra_chave: string
) => {

  const userRepo = AppDataSource.getRepository(User);

  const exists = await userRepo.findOne({ where: { email } });
  if (exists) {
    const err: any = new Error("E-mail já cadastrado");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepo.create({
    name,
    email,
    password: hashedPassword,
    data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
    palavra_chave
  });

  await userRepo.save(newUser);

  return { message: "Usuário registrado com sucesso" };
};


export const login = async (email: string, password: string) => {
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    const err: any = new Error("Usuário não encontrado");
    err.status = 404;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const err: any = new Error("Senha incorreta");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );

  return {
    message: "Login efetuado",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      dataNascimento: user.data_nascimento,
      dataCriacao: user.data_criacao
    }
  };
};