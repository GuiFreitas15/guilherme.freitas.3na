import { AppDataSource } from "../data-source";
import { User } from "../models/User";

const userRepo = AppDataSource.getRepository(User);

// Get user
export const getUserById = async (id: number) => {
  const user = await userRepo.findOne({
    where: { id },
    relations: ["lembretes", "categorias"],
  });

  if (!user) throw new Error("Usuário não encontrado");

  const { password, ...safeUser } = user;
  return safeUser;
};

// Update user
export const updateUser = async (id: number, data: any) => {
  const user = await userRepo.findOne({ where: { id } });

  if (!user) throw new Error("Usuário não encontrado");

  user.name = data.name ?? user.name;
  user.email = data.email ?? user.email;
  user.data_nascimento = data.dataNascimento ?? user.data_nascimento;
  user.palavra_chave = data.palavraChave ?? user.palavra_chave;

  await userRepo.save(user);

  return { message: "Usuário atualizado" };
};

// Delete
export const deleteUser = async (id: number) => {
  const result = await userRepo.delete(id);

  if (result.affected === 0) throw new Error("Usuário não encontrado");

  return { message: "Usuário deletado" };
};