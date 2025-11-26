// src/routes/chatbot.ts
import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Lembrete } from "../models/Lembrete";
import { Checklist } from "../models/Checklist";
import { Categoria } from "../models/Categoria";

const router = Router();

/* --------------------------------------
   Utilitários leves e seguros
-------------------------------------- */
function normalize(text?: string): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s\/\-:]/g, " ") // mantém alguns símbolos úteis
    .replace(/\s+/g, " ")
    .trim();
}

function isGreeting(q: string) {
  return /\b(oi|ola|olá|bom dia|boa tarde|boa noite|e ai|e aí|opa)\b/.test(q);
}

function containsAny(q: string, words: string[]) {
  return words.some(w => q.includes(w));
}

function parseRelativeDate(q: string): string | null {
  const t = normalize(q);
  const today = new Date();
  if (/\bhoje\b/.test(t)) return today.toISOString().slice(0, 10);
  if (/\bamanha\b|\bamanhã\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (/\bontem\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return null;
}
function parseDateAsLocal(iso?: string | null): Date | null {
  if (!iso) return null;

  const onlyDate = /^\d{4}-\d{2}-\d{2}$/.test(iso.trim());
  if (onlyDate) {
    const [yStr, mStr, dStr] = iso.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
    return new Date(y, m - 1, d); // cria data NO HORÁRIO LOCAL (meio-dia local = evita DST issues)
  }

  // tenta parsear ISO completo; pode retornar Invalid Date
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

/** Formata "YYYY-MM-DD" ou ISO para "DD/MM/YYYY" usando parseDateAsLocal */
function formatDateLocal(iso?: string | null): string {
  const d = parseDateAsLocal(iso);
  if (!d) return "";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/** Retorna string "YYYY-MM-DD" para a data local atual (usado em comparações) */
function todayLocalIso(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Retorna string "YYYY-MM-DD" para amanhã no horário local */
function tomorrowLocalIso(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Retorna string "YYYY-MM-DD" para ontem no horário local */
function yesterdayLocalIso(): string {
  const t = new Date();
  t.setDate(t.getDate() - 1);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Função auxiliar para gerar YYYY-MM-DD com data LOCAL
const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* -----------------------------------------------------------
   PARSER DE DATAS COMPLETO (específicas, semanas, meses, intervalo)
----------------------------------------------------------- */

// converte "12 março" ou "12 mar" em YYYY-MM-DD
function parseDayMonth(text: string): string | null {
  const meses: Record<string, number> = {
    janeiro: 1, jan: 1,
    fevereiro: 2, fev: 2,
    marco: 3, mar: 3,
    abril: 4, abr: 4,
    maio: 5,
    junho: 6, jun: 6,
    julho: 7, jul: 7,
    agosto: 8, ago: 8,
    setembro: 9, set: 9,
    outubro: 10, out: 10,
    novembro: 11, nov: 11,
    dezembro: 12, dez: 12
  };

  const m = text.match(/(\d{1,2})\s+(de\s+)?([a-z]+)/i);
  if (!m) return null;

  const dia = Number(m[1]);
  const mesNome = normalize(m[3]);
  const mes = meses[mesNome];
  if (!mes) return null;

  const ano = new Date().getFullYear();
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// converte "15/01" e "15-01"
function parseDayMonthDigits(text: string): string | null {
  const m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?\b/);
  if (!m) return null;

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = m[3] ? Number(m[3]) : new Date().getFullYear();

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// "dia 15"
function parseDayOnly(text: string): string | null {
  const m = text.match(/\bdia\s+(\d{1,2})\b/);
  if (!m) return null;

  const dia = Number(m[1]);
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// intervalos "entre 10 e 15", "entre 10/01 e 15/01", "entre 5 e 10 de março"
function parseInterval(text: string): { start: string; end: string } | null {
  const m = text.match(/entre\s+(.+?)\s+e\s+(.+)/);
  if (!m) return null;

  const d1 = m[1].trim();
  const d2 = m[2].trim();

  const p1 =
    parseDayMonth(d1) ||
    parseDayMonthDigits(d1) ||
    parseDayOnly(d1);
  const p2 =
    parseDayMonth(d2) ||
    parseDayMonthDigits(d2) ||
    parseDayOnly(d2);

  if (p1 && p2) return { start: p1, end: p2 };
  return null;
}

// (função principal)
function parseSpecificDate(q: string): string | null {
  return (
    parseDayMonth(q) ||
    parseDayMonthDigits(q) ||
    parseDayOnly(q)
  );
}

function parseDateRange(q: string): { start: string; end: string } | null {
  const regex = /(entre|de)\s+(.+?)\s+(e|até|a)\s+(.+)/i;
  const m = q.match(regex);
  if (!m) return null;

  const d1 = parseSpecificDate(m[2]);
  const d2 = parseSpecificDate(m[4]);
  if (!d1 || !d2) return null;

  if (d1 <= d2) return { start: d1, end: d2 };
  return { start: d2, end: d1 };
}

function parsePeriod(q: string):
  | { start: string; end: string; label: string }
  | null 
{
  q = q.toLowerCase();

  const today = new Date();
  const d = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

  if (/essa semana|esta semana|semana atual/.test(q)) {
    const now = new Date();
    const dow = now.getDay(); // 0=Dom
  
    // Segunda-feira da semana atual
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  
    // Domingo
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
  
    return {
      start: toLocalISO(start),
      end: toLocalISO(end),
      label: "Esta semana"
    };
  }
  
  if (/semana que vem/.test(q)) {
    const now = new Date();
    const dow = now.getDay();
  
    // Próxima segunda
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + 7);
  
    // Próximo domingo
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
  
    return {
      start: toLocalISO(start),
      end: toLocalISO(end),
      label: "Semana que vem"
    };
  }
  
  // ESTE MÊS
  if (/este mes|esse mes|mes atual/.test(q)) {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth();
  
    const start = new Date(ano, mes, 1);
    const end = new Date(ano, mes + 1, 0); // último dia do mês
  
    return {
      start: toLocalISO(start),
      end: toLocalISO(end),
      label: "Este mês"
    };
  }
  
  // MÊS QUE VEM
  if (/mes que vem|proximo mes|próximo mês/.test(q)) {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth() + 1; // mês seguinte
  
    const start = new Date(ano, mes, 1);
    const end = new Date(ano, mes + 1, 0);
  
    return {
      start: toLocalISO(start),
      end: toLocalISO(end),
      label: "Mês que vem"
    };
  }
  
  // ANO QUE VEM
  if (/ano que vem/.test(q)) {
    const ano = today.getFullYear() + 1;
  
    return {
      start: `${ano}-01-01`,
      end: `${ano}-12-31`,
      label: "Ano que vem"
    };
  }

  return null;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function renderChatLembrete(i: Lembrete) {
  const prioridade = i.prioridade ? i.prioridade.toLowerCase() : "low";
  const dateStr = formatDateLocal(i.data);

  return `
    <div class="chat-lembrete">
      <div class="chat-lembrete-title">${i.titulo ?? "(sem título)"}</div>
      <div class="chat-lembrete-info">
        <span>${dateStr}</span>
        ${
          i.prioridade
            ? `<span class="chat-priority ${prioridade}">${i.prioridade}</span>`
            : ""
        }
      </div>
    </div>
  `;
}



/* --------------------------------------
   Rota /chatbot
   Espera body: { userId?: number, userEmail?: string, question: string }
   (ou use autenticação e pegue user do token)
-------------------------------------- */
router.post("/chatbot", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, question } = req.body ?? {};
    if (!question || String(question).trim().length === 0) {
      return res.status(400).json({ error: "Envie uma pergunta em 'question'." });
    }

    const qRaw = String(question);
    const q = normalize(qRaw);

    console.debug("[chatbot] pergunta:", qRaw);
    console.debug("[chatbot] normalizada:", q);

    // Repositórios
    const lembRepo = AppDataSource.getRepository(Lembrete);
    const catRepo = AppDataSource.getRepository(Categoria);

    // Função para aplicar filtro por usuário em query builders (usa JOIN para evitar l.userId)
    const applyUserFilterQB = (qb: any) => {
      if (userId) {
        qb.leftJoin("l.user", "u").andWhere("u.id = :uid", { uid: userId });
      } else if (userEmail) {
        qb.leftJoin("l.user", "u").andWhere("u.email = :email", { email: userEmail });
      }
      return qb;
    };

    // 0) Saudações
    if (isGreeting(q)) {
      return res.json({
        answer: "Olá! 😊 Posso ajudar a ver seus lembretes — pergunte algo como: \"O que tenho hoje?\" ou \"Quantos de prioridade alta?\""
      });
    }
    

// ============================================================================
//  BLOCO UNIFICADO DE DATAS
//  (relativas, específicas, períodos e intervalos)
// ============================================================================

{
  // 1) Datas relativas (hoje / amanhã / ontem)
  const relativeDate = parseRelativeDate(q);

  // 2) Datas específicas (15/01, 12 de março, dia 20)
  const specificDate = parseSpecificDate(q);

  // 3) Intervalos explícitos (entre 10 e 15, de 02/01 a 10/01)
  const dateRange = parseDateRange(q); 
  // retorna: { start: "2025-01-10", end: "2025-01-15" }

  // 4) Períodos (essa semana, mês que vem...)
  const periodRange = parsePeriod(q);
  // retorna: { start: "2025-02-01", end: "2025-02-28" }

  // --------------------------------------------------------------------------
  // INTERVALO DE DATAS → prioridade máxima
  // --------------------------------------------------------------------------
  if (dateRange) {
    const qb = lembRepo.createQueryBuilder("l")
      .leftJoinAndSelect("l.checklist", "c");
    applyUserFilterQB(qb);

    qb.andWhere("l.data BETWEEN :start AND :end", dateRange);

    const items = await qb.getMany();

    const pretty = `Entre ${formatDateLocal(dateRange.start)} e ${formatDateLocal(dateRange.end)}`;

    if (items.length === 0) {
      return res.json({
        answer: `<p><b>${pretty}</b> você não tem nenhum lembrete.</p>`
      });
    }

    return res.json({
      answer: `<p><b>${pretty}</b> foram encontrados <b>${items.length}</b> lembretes:</p>` +
              items.map(renderChatLembrete).join(""),
      items
    });
  }

  // --------------------------------------------------------------------------
  // PERÍODOS → prioridade logo após intervalos
  // --------------------------------------------------------------------------
  if (periodRange) {
    const qb = lembRepo.createQueryBuilder("l")
      .leftJoinAndSelect("l.checklist", "c");
    applyUserFilterQB(qb);

    qb.andWhere("l.data BETWEEN :start AND :end", periodRange);

    const items = await qb.getMany();

    const pretty = periodRange.label; // ex: "Esta semana", "Mês que vem"

    if (items.length === 0) {
      return res.json({
        answer: `<p><b>${pretty}</b> você não tem nenhum lembrete.</p>`
      });
    }

    return res.json({
      answer: `<p><b>${pretty}</b> foram encontrados <b>${items.length}</b> lembretes:</p>` +
              items.map(renderChatLembrete).join(""),
      items
    });
  }

  // --------------------------------------------------------------------------
  // DATAS exatas (relativas ou específicas)
  // --------------------------------------------------------------------------
  const finalDate = relativeDate || specificDate;
  if (finalDate) {
    const qb = lembRepo.createQueryBuilder("l")
      .leftJoinAndSelect("l.checklist", "c");
    applyUserFilterQB(qb);

    qb.andWhere("l.data = :date", { date: finalDate });

    const items = await qb.getMany();

    let pretty = "";

    if (relativeDate) {
      const map: Record<string, string> = {
        [todayLocalIso()]: "Hoje",
        [tomorrowLocalIso()]: "Amanhã",
        [yesterdayLocalIso()]: "Ontem"
      };

      pretty = map[relativeDate] ?? `Dia ${formatDateLocal(relativeDate)}`;
    } else if (specificDate) {
      pretty = formatDateLocal(specificDate);
    }

    return res.json({
      answer: `<p><b>${pretty}</b> foram encontrados <b>${items.length}</b> lembretes:</p>` +
              items.map(renderChatLembrete).join(""),
      items
    });
  }
}

// 2) Prioridades (Alta / Média / Baixa)
let priorityFilter: string | null = null;

// Detectar prioridade específica que o usuário pediu
if (containsAny(q, ["alta", "high", "urgente", "importante"])) {
  priorityFilter = "high";
} else if (containsAny(q, ["media", "média", "medium", "moderada"])) {
  priorityFilter = "medium";
} else if (containsAny(q, ["baixa", "low", "leve"])) {
  priorityFilter = "low";
}

const qb = lembRepo.createQueryBuilder("l");
applyUserFilterQB(qb);

if (priorityFilter) {
  // Caso usuário pediu uma prioridade específica
  qb.andWhere("LOWER(l.prioridade) LIKE :p", { p: `%${priorityFilter}%` });
  const items = await qb.getMany();

  const prtPriority =
    priorityFilter === "high" ? "Alta" :
    priorityFilter === "medium" ? "Média" :
    "Baixa";

  if (!items.length) {
    return res.json({
      answer: `Nenhum lembrete encontrado com prioridade ${prtPriority}.`
    });
  }

  const formatDate = (iso?: string | null) => formatDateLocal(iso);

  const listaHTML = items
    .map(i => {
      const dateStr = i.data ? formatDate(i.data) : "";
      // Garante a classe em inglês para o CSS
      const prioridadeClass = i.prioridade ? i.prioridade.toLowerCase() : "low";
      
      // Traduz o texto para exibição
      const mapPrio: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
      const prioridadeLabel = mapPrio[prioridadeClass] || "Baixa";

      return `
        <div class="chat-lembrete">
          <div class="chat-lembrete-title">${i.titulo ?? "(sem título)"}</div>
          <div class="chat-lembrete-info">
            <span>${dateStr}</span>
            ${i.prioridade ? `<span class="chat-priority ${prioridadeClass}">${prioridadeLabel}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  return res.json({
    answer: `<p>Lembretes com prioridade <b>${prtPriority}</b> (${items.length}):</p>${listaHTML}`,
    items
  });
} else if (q === "prioridades" || q == "prioridade")  {
  // Caso usuário só digite "prioridades" → resumo geral
  const allItems = await qb.getMany();

  const counts = { high: 0, medium: 0, low: 0 };
  allItems.forEach(i => {
    const p = i.prioridade?.toLowerCase();
    if (p === "high") counts.high++;
    else if (p === "medium") counts.medium++;
    else counts.low++;
  });

  const html = `
    <p>Suas prioridades:</p>
    <ul>
      <li><span class="chat-priority high">Alta: ${counts.high}</span></li>
      <li><span class="chat-priority medium">Média: ${counts.medium}</span></li>
      <li><span class="chat-priority low">Baixa: ${counts.low}</span></li>
    </ul>
  `;

  return res.json({ answer: html, items: allItems });
}

// 3) Categorias
if (q.includes("categoria")) {
  const palavras = q.split(" ");

  const todasCategorias = await catRepo.find();
  let candidate: string | null = null;

  for (const cat of todasCategorias) {
    const nomeNorm = normalize(cat.nome);
    if (q.includes(nomeNorm)) {
      candidate = cat.nome; 
      break;
    }
  }

  if (!candidate) {
    const ultima = palavras[palavras.length - 1];
    if (!ultima || ultima.length < 2) {
      return res.json({
        answer: "Qual categoria você quer filtrar? Exemplo: 'categoria mercado'."
      });
    }
    candidate = ultima;
  }

  const qb = lembRepo.createQueryBuilder("l");
  applyUserFilterQB(qb);

  qb.andWhere("LOWER(l.categorias) LIKE :c", {
    c: `%${normalize(candidate)}%`
  });

  const items = await qb.getMany();

  if (!items.length) {
    return res.json({
      answer: `Nenhum lembrete encontrado na categoria "${candidate}".`
    });
  }

  // --- formatar DD/MM/YYYY ---
  const formatDate = (iso?: string | null) => formatDateLocal(iso);

 // gerar lista de lembretes em HTML estilizado
const listaHTML = items
.map(i => {
  const dateStr = i.data ? formatDate(i.data) : "";
  const prioridadeClass = i.prioridade ? i.prioridade.toLowerCase() : "low";
  
  // Tradução
  const mapPrio: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
  const prioridadeLabel = mapPrio[prioridadeClass] || "Baixa";

  return `
    <div class="chat-lembrete">
      <div class="chat-lembrete-title">${i.titulo ?? "(sem título)"}</div>
      <div class="chat-lembrete-info">
        <span>${dateStr}</span>
        ${i.prioridade ? `<span class="chat-priority ${prioridadeClass}">${prioridadeLabel}</span>` : ""}
      </div>
    </div>
  `;
})
.join(""); // sem separador, porque já temos divs

return res.json({
answer: `<p>Na categoria "<b>${candidate}</b>" tem ${items.length} lembrete(s):</p>${listaHTML}`,
items
});
}

// 2.5) RESUMO GERAL — versão TypeScript-safe (anotações de tipo)
if (
  containsAny(q, ["resumo", "resumao", "resumir", "visao geral", "geral", "mostrar tudo"])
) {
  const qb = lembRepo.createQueryBuilder("l")
    .leftJoinAndSelect("l.checklist", "c");

  applyUserFilterQB(qb);

  const all: Lembrete[] = await qb.getMany();

  if (!all.length) {
    return res.json({ answer: "Você ainda não tem nenhum lembrete cadastrado." });
  }

  // ---- Estatísticas gerais ----
  const total = all.length;
  const prio = { high: 0, medium: 0, low: 0 };
  const categorias: Record<string, number> = {};
  const futuros: Lembrete[] = [];

  const hoje = new Date().toISOString().slice(0, 10);

  for (const lemb of all) {
    // --------- PRIORIDADE (seguro) ----------
    const prioridadeRaw: unknown = lemb.prioridade ?? "low";
    const prioridadeStr = (typeof prioridadeRaw === "string" ? prioridadeRaw : String(prioridadeRaw)).toLowerCase();
    if (prioridadeStr === "high") prio.high++;
    else if (prioridadeStr === "medium") prio.medium++;
    else prio.low++;

    // --------- CATEGORIAS (múltiplos formatos) ----------
    const catsRaw: unknown = lemb.categorias;
    let parts: string[] = [];

    if (Array.isArray(catsRaw)) {
      // array: garantir strings e trim
      parts = (catsRaw as any[])
        .map((it: any) => (it == null ? "" : String(it)))
        .map((s: string) => s.trim())
        .filter((s: string): s is string => s.length > 0);
    } else if (typeof catsRaw === "string") {
      const s = catsRaw.trim();
      if (s.length) {
        parts = s
          .split(",")
          .map((token: string) => (token == null ? "" : token).toString().trim())
          .filter((t: string): t is string => t.length > 0);
      }
    } else if (catsRaw != null) {
      // número/objeto — tentar converter para string
      try {
        const s = String(catsRaw).trim();
        if (s.length) {
          parts = s
            .split(",")
            .map((token: string) => token.toString().trim())
            .filter((t: string): t is string => t.length > 0);
        }
      } catch (e) {
        parts = [];
      }
    }

    for (const c of parts) {
      categorias[c] = (categorias[c] || 0) + 1;
    }

    // --------- PRÓXIMOS lembretes (datas seguras) ----------
    if (lemb.data && typeof lemb.data === "string") {
      const dsafe = lemb.data;
      if (dsafe >= hoje) futuros.push(lemb);
    }
  }

  // ordenar próximos com comparador seguro
  futuros.sort((a, b) => {
    const da = a.data ?? "";
    const db = b.data ?? "";
    return da.localeCompare(db);
  });

  const proximos = futuros.slice(0, 5);

  // formatação segura de data
  const fmt = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
  };

  const proxHTML = proximos
    .map((next: Lembrete) => {
        // Tradução no resumo
        const pRaw = next.prioridade ? String(next.prioridade).toLowerCase() : "low";
        const mapPrio: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
        const pLabel = mapPrio[pRaw] || "Baixa";

        return `
          <div class="chat-lembrete">
            <div class="chat-lembrete-title">${next.titulo ?? "(sem título)"}</div>
            <div class="chat-lembrete-info">
              <span>${fmt(next.data)}</span>
              ${
                next.prioridade
                  ? `<span class="chat-priority ${pRaw}">${pLabel}</span>`
                  : ""
              }
            </div>
          </div>
        `;
    })
    .join("");

  const catHTML = Object.keys(categorias)
    .map((cn: string) => `<li>${cn}: ${categorias[cn]}</li>`)
    .join("") || "<li>—</li>";

  const answer = `
    <p><b>Resumo geral dos seus lembretes:</b></p>
    <ul>
      <li>Total: <b>${total}</b></li>
      <li>Alta: <span class="chat-priority high">${prio.high}</span></li>
      <li>Média: <span class="chat-priority medium">${prio.medium}</span></li>
      <li>Baixa: <span class="chat-priority low">${prio.low}</span></li>
    </ul>

    <p><b>Categorias mais usadas:</b></p>
    <ul>${catHTML}</ul>

    <p><b>Próximos lembretes:</b></p>
    ${proxHTML}
  `;

  return res.json({ answer, items: all });
}

// 4) Busca por palavra-chave (título / descrição / checklist text)
const tokens = q
  .replace(/[?¡!,.]/g, " ")
  .split(/\s+/)
  .filter(t =>
    t.length > 2 &&
    !["me","tenho","eu","quem","onde","quando","o","a","os","as","de","do","da","para","pra"].includes(t)
  );

if (tokens.length > 0) {
  const qb = lembRepo.createQueryBuilder("l")
    .leftJoinAndSelect("l.checklist", "c")
    .leftJoin("l.user", "u");

  // apply user filter
  if (userId) qb.andWhere("u.id = :uid", { uid: userId });
  else if (userEmail) qb.andWhere("u.email = :email", { email: userEmail });

  // montar condições OR para os tokens
  const orParts: string[] = [];
  const params: Record<string, string> = {};

  tokens.forEach((tk, i) => {
    const p = `%${tk.toLowerCase()}%`;
    params[`k${i}`] = p;

    orParts.push(`LOWER(l.titulo) LIKE :k${i}`);
    orParts.push(`LOWER(l.descricao) LIKE :k${i}`);
    orParts.push(`LOWER(c.text) LIKE :k${i}`);
    orParts.push(`LOWER(l.categorias) LIKE :k${i}`);
  });

  if (orParts.length) {
    qb.andWhere("(" + orParts.join(" OR ") + ")", params);

    const found = await qb.getMany();

    if (found.length > 0) {

      // formatar data dd/mm/yyyy
      const formatDateForSearch = (iso?: string | null) => formatDateLocal(iso);

      const htmlList = found
        .map(f => {
          const date = f.data ? formatDateForSearch(f.data) : "—";
          const title = f.titulo ?? "(sem título)";
          
          // CSS Class (inglês)
          const prioClass = f.prioridade ? f.prioridade.toLowerCase() : "low"; 
          
          // Texto (português)
          const mapPrio: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
          const priorityLabel = f.prioridade ? (mapPrio[prioClass] || "Baixa") : "";

          return `
            <div class="chat-lembrete">
              <div class="chat-lembrete-title">${title}</div>
              <div class="chat-lembrete-info">
                <span class="chat-date">${date}</span>
                ${priorityLabel ? `<span class="chat-priority ${prioClass}">${priorityLabel}</span>` : ""}
              </div>
            </div>
          `;
        })
        .join("");

      return res.json({
        answer: `<div>Foram encontrados ${found.length} lembrete(s) relacionados à sua busca: </div>${htmlList}`,
        items: found
      });
    }
  }
}



// 4.5 Quantidade de Lembretes
if (
  q.includes("quantos") && 
  (q.includes("lembrete") || q.includes("lembretes"))
) {
  const qbCount = lembRepo.createQueryBuilder("l");
  applyUserFilterQB(qbCount);

  const total = await qbCount.getCount();

  return res.json({
    answer: `Você tem <b>${total}</b> lembrete${total === 1 ? "" : "s"} cadastrados`
  });
}


    // 5) Se chegou aqui, retorno amigável
    return res.json({
      answer:
        "Desculpe — não encontrei resultados precisos. Exemplos de perguntas que funcionam:\n" +
        "- \"O que tenho para hoje?\"\n" +
        "- \"Quantos lembretes com prioridade alta?\"\n" +
        "- \"Mostrar lembretes da categoria trabalho\"\n" +
        "- \"Procurar lembretes sobre reunião\"\n"
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Erro interno no chatbot" });
  }
});

export default router;