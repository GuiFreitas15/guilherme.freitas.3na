import { AppDataSource } from "../data-source";
import { Lembrete } from "../models/Lembrete";
import { User } from "../models/User";

const lembRepo = () => AppDataSource.getRepository(Lembrete);
const userRepo = () => AppDataSource.getRepository(User);

/* ============================================================
   ✅ CRIAR LEMBRETE
============================================================ */
export const createLembrete = async (userId: number, data: Partial<Lembrete>) => {
  const user = await userRepo().findOneBy({ id: userId });
  if (!user) throw { status: 404, message: "Usuário não encontrado" };

  // checklist sempre array
  if (!Array.isArray(data.checklist)) data.checklist = [];

  // Mapeia tipoConteudo → tipo_conteudo
  if ((data as any).tipoConteudo) {
    data.tipo_conteudo = (data as any).tipoConteudo;
  }

  // categorias sempre array
  if (!Array.isArray(data.categorias)) data.categorias = [];

  const lemb = lembRepo().create({
    ...data,
    user,
  });

  const saved = await lembRepo().save(lemb);

  return {
    ...saved,
    tipoConteudo: saved.tipo_conteudo,
    checklist: Array.isArray(saved.checklist) ? saved.checklist : [],
    categorias: saved.categorias || [],
  };
};

/* ============================================================
   ✅ LISTAR LEMBRETES DO USUÁRIO
============================================================ */
export const listLembretes = async (userId: number) => {
  const lembretes = await lembRepo().find({
    where: { user: { id: userId } },
    relations: ["checklist"],
  });

  return lembretes.map((l) => ({
    id: l.id,
    titulo: l.titulo,
    data: l.data,
    hora: l.hora,
    prioridade: l.prioridade,
    tipoConteudo: l.tipo_conteudo,
    descricao: l.descricao,
    cor: l.cor,
    categorias: l.categorias || [],
    concluido: l.concluido,
    checklist: Array.isArray(l.checklist)
      ? l.checklist.map((item) => ({
          id: item.id,
          text: item.text,
          checked: item.checked,
        }))
      : [],
  }));
};

/* ============================================================
   ✅ PEGAR LEMBRETE POR ID
============================================================ */
export const getLembrete = async (userId: number, id: number) => {
  const l = await lembRepo().findOne({
    where: { id, user: { id: userId } },
    relations: ["checklist"],
  });

  if (!l) throw { status: 404, message: "Lembrete não encontrado" };

  return {
    id: l.id,
    titulo: l.titulo,
    data: l.data,
    hora: l.hora,
    prioridade: l.prioridade,
    tipoConteudo: l.tipo_conteudo,
    descricao: l.descricao,
    cor: l.cor,
    categorias: l.categorias || [],
    concluido: l.concluido,
    checklist: Array.isArray(l.checklist)
      ? l.checklist.map((item) => ({
          id: item.id,
          text: item.text,
          checked: item.checked,
        }))
      : [],
  };
};

/* ============================================================
   ✅ ATUALIZAR LEMBRETE
============================================================ */
export const updateLembrete = async (userId: number, id: number, data: Partial<Lembrete>) => {
  const l = await lembRepo().findOne({
    where: { id, user: { id: userId } },
    relations: ["checklist"],
  });

  if (!l) throw { status: 404, message: "Lembrete não encontrado" };

  if (!Array.isArray(data.checklist)) data.checklist = [];
  if (!Array.isArray(data.categorias)) data.categorias = [];

  if ((data as any).tipoConteudo) {
    data.tipo_conteudo = (data as any).tipoConteudo;
  }

  delete (data as any).id;

  lembRepo().merge(l, data);

  try {
    const saved = await lembRepo().save(l);

    return {
      id: saved.id,
      titulo: saved.titulo,
      data: saved.data,
      hora: saved.hora,
      prioridade: saved.prioridade,
      tipoConteudo: saved.tipo_conteudo,
      descricao: saved.descricao,
      cor: saved.cor,
      categorias: saved.categorias || [],
      concluido: saved.concluido,
      checklist: Array.isArray(saved.checklist)
        ? saved.checklist.map((item) => ({
            id: item.id,
            text: item.text,
            checked: item.checked,
          }))
        : [],
    };
  } catch (err) {
    console.error("Erro ao salvar lembrete:", err);
    throw { status: 500, message: "Erro ao salvar lembrete" };
  }
};

/* ============================================================
   ✅ DELETAR LEMBRETE
============================================================ */
export const deleteLembrete = async (userId: number, id: number) => {
  const l = await lembRepo().findOne({
    where: { id, user: { id: userId } },
  });

  if (!l) throw { status: 404, message: "Lembrete não encontrado" };
  await lembRepo().remove(l);
};
