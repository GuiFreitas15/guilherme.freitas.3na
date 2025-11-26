import { AppDataSource } from "../data-source";
import { Categoria } from "../models/Categoria";
import { User } from "../models/User";

const categoriaRepository = AppDataSource.getRepository(Categoria);
const userRepository = AppDataSource.getRepository(User);

export class CategoriaService {
  static async criarCategoria(userId: number, nome: string, descricao?: string) {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new Error("Usuário não encontrado");

    const categoria = categoriaRepository.create({ nome, descricao, user });
    return categoriaRepository.save(categoria);
  }

  static async listarCategoriasPorUsuario(userId: number) {
    return categoriaRepository.find({
      where: { user: { id: userId } },
      order: { nome: "ASC" },
    });
  }

  static async editarCategoria(id: number, userId: number, nome: string, descricao?: string) {
    const categoria = await categoriaRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!categoria) throw new Error("Categoria não encontrada");

    categoria.nome = nome;
    if (descricao !== undefined) categoria.descricao = descricao;

    return categoriaRepository.save(categoria);
  }

  static async deletarCategoria(id: number, userId: number) {
    const categoria = await categoriaRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!categoria) throw new Error("Categoria não encontrada");

    return categoriaRepository.remove(categoria);
  }
}
