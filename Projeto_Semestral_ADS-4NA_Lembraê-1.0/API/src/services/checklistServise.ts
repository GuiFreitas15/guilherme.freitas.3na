import { AppDataSource } from "../data-source";
import { Checklist } from "../models/Checklist";
import { Lembrete } from "../models/Lembrete";

const checklistRepo = () => AppDataSource.getRepository(Checklist);
const lembRepo = () => AppDataSource.getRepository(Lembrete);

/* ============================================================
   ✅ ADICIONAR ITEM AO CHECKLIST
============================================================ */
export const addItem = async (lembreteId: number, data: Partial<Checklist>) => {
  const lemb = await lembRepo().findOneBy({ id: lembreteId });
  if (!lemb) throw { status: 404, message: "Lembrete não encontrado" };

  const item = checklistRepo().create({
    text: data.text ?? "",
    checked: data.checked ?? false,
    lembrete: lemb
  });

  return await checklistRepo().save(item);
};

/* ============================================================
   ✅ ATUALIZAR ITEM DO CHECKLIST
============================================================ */
export const updateItem = async (id: number, data: Partial<Checklist>) => {
  const item = await checklistRepo().findOneBy({ id });
  if (!item) throw { status: 404, message: "Item não encontrado" };

  item.text = data.text ?? item.text;
  item.checked = data.checked ?? item.checked;

  return await checklistRepo().save(item);
};

/* ============================================================
   ✅ DELETAR ITEM DO CHECKLIST (FUNCIONANDO NO BANCO)
============================================================ */
export const deleteItem = async (id: number) => {
    const result = await checklistRepo().delete(id);
  
    if (result.affected === 0) {
      throw { status: 404, message: "Item não encontrado" };
    }
};
