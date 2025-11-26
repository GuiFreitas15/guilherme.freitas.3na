import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import bcrypt from "bcrypt";

const userRepo = AppDataSource.getRepository(User);

// 1️⃣ Verificar usuário direto no banco
export const verifyRecovery = async (
  email: string,
  dataNascimento: string,
  palavraChave: string
) => {
  const user = await userRepo.findOne({
    where: { email }
  });

  if (!user) {
    const err: any = new Error("Usuário não encontrado");
    err.status = 404;
    throw err;
  }

  // Converter para comparar datas
  const dataFormatada = new Date(user.data_nascimento)
    .toISOString()
    .split("T")[0];

  if (dataFormatada !== dataNascimento) {
    const err: any = new Error("Data de nascimento incorreta");
    err.status = 400;
    throw err;
  }

  if (user.palavra_chave !== palavraChave) {
    const err: any = new Error("Palavra-chave incorreta");
    err.status = 400;
    throw err;
  }

  // SUCESSO
  return { message: "Autorizado" };
};

// 2️⃣ Redefinir senha
export const resetPassword = async (email: string, newPassword: string) => {
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    const err: any = new Error("Usuário não encontrado");
    err.status = 404;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;

  await userRepo.save(user);

  return { message: "Senha redefinida com sucesso" };
};
