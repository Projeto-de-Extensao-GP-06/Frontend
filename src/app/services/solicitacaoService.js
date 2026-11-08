import { api } from "@/app/provider/api";

function montarQuery(params, incluirDesempate = false) {
  const query = new URLSearchParams();
  const { sort, ...rest } = params;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const sorts = Array.isArray(sort) ? [...sort] : sort ? [sort] : [];
  if (incluirDesempate && !sorts.some((item) => item.startsWith("id,"))) {
    sorts.push("id,desc");
  }
  sorts.forEach((item) => query.append("sort", item));

  return query.toString();
}

function formatarData(dataIso) {
  if (!dataIso) return null;
  const [ano, mes, dia] = String(dataIso).split("T")[0].split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
}

function formatarDataHora(dataIso) {
  if (!dataIso) return { data: "-", hora: null };
  const [data, horaCompleta] = String(dataIso).split("T");
  const [ano, mes, dia] = (data || "").split("-");
  const hora = horaCompleta ? horaCompleta.slice(0, 5) : null;
  const dataFormatada = ano && mes && dia ? `${dia}/${mes}/${ano}` : data || "-";
  return { data: dataFormatada, hora };
}

function formatarDataHoraCompleta(dataIso) {
  const { data, hora } = formatarDataHora(dataIso);
  return hora ? `${data} às ${hora}` : data;
}

export async function listarSolicitacoes({ page = 0, size = 20, sort, signal } = {}) {
  const query = montarQuery({ page, size, sort });
  const response = await api.get(`/solicitacoes?${query}`, { signal });
  return response.data;
}

export async function filtrarSolicitacoes({
  tipo,
  pesquisa,
  dataInicio,
  dataFim,
  page = 0,
  size = 20,
  sort,
  signal,
} = {}) {
  const query = montarQuery({
    tipo: tipo?.trim(),
    pesquisa: pesquisa?.trim(),
    dataInicio,
    dataFim,
    page,
    size: Math.min(Number(size) || 20, 100),
    sort,
  });
  const response = await api.get(`/solicitacoes/filtrar?${query}`, { signal });
  return response.data;
}

export async function buscarSolicitacaoPorId(id, { signal } = {}) {
  const response = await api.get(`/solicitacoes/${encodeURIComponent(id)}`, { signal });
  return response.data;
}

export async function buscarDuplicidadesSolicitacao(id, { signal } = {}) {
  const response = await api.get(`/solicitacoes/${encodeURIComponent(id)}/duplicidades`, { signal });
  return response.data;
}

export async function aceitarSolicitacao(id, dados) {
  const response = await api.patch(`/solicitacoes/${encodeURIComponent(id)}/aceitar`, dados);
  return response.data;
}

export async function negarSolicitacao(id) {
  const response = await api.patch(`/solicitacoes/${encodeURIComponent(id)}/negar`);
  return response.data;
}

export async function atualizarDadosSolicitacao(id) {
  const response = await api.post(`/solicitacoes/${encodeURIComponent(id)}/atualizar-dados`);
  return response.data;
}

export function conectarStatusSincronizacaoSolicitacao(id, { onIniciado, onProcessando, onReprocessando, onConcluido, onError } = {}) {
  const baseUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8080" : "");
  const url = `${baseUrl}/solicitacoes/${encodeURIComponent(id)}/sincronizacao-status`;
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.addEventListener("CONECTADO", (e) => {
    try {
      const data = JSON.parse(e.data);
      onIniciado?.(data);
    } catch (_) {}
  });

  eventSource.addEventListener("ENFILEIRADO", (e) => {
    try {
      const data = JSON.parse(e.data);
      onIniciado?.(data);
    } catch (_) {}
  });

  eventSource.addEventListener("PROCESSANDO", (e) => {
    try {
      const data = JSON.parse(e.data);
      onProcessando?.(data);
    } catch (_) {}
  });

  eventSource.addEventListener("REPROCESSANDO", (e) => {
    try {
      const data = JSON.parse(e.data);
      onReprocessando?.(data);
    } catch (_) {}
  });

  eventSource.addEventListener("CONCLUIDO", (e) => {
    try {
      const data = JSON.parse(e.data);
      onConcluido?.(data);
    } catch (_) {
      onConcluido?.(null);
    } finally {
      eventSource.close();
    }
  });

  eventSource.onerror = (e) => {
    try {
      eventSource.close();
    } catch (_) {}
    onError?.(e);
  };

  return () => {
    eventSource.close();
  };
}

export function mapearSolicitacao(dto = {}) {
  const processo = dto.processo || null;
  const data = dto.dataSolicitacao || dto.dataHoraInicio || dto.ultimaAtualizacao;
  const [dia, mes, ano] = data?.split("T")[0]?.split("-") || [];
  const createdAt = dia && mes && ano ? `${dia}/${mes}/${ano}` : "—";
  const [respostaDia, respostaMes, respostaAno] = dto.dataResposta?.split("T")[0]?.split("-") || [];
  const dataResposta = respostaDia && respostaMes && respostaAno
    ? `${respostaDia}/${respostaMes}/${respostaAno}`
    : dto.dataResposta || null;
  const status = (dto.status || "PENDENTE").toLocaleLowerCase("pt-BR");
  const nome = dto.nomeCompleto || dto.nomeRazaoSocial || dto.nome || "Nome não informado";
  const isPF = dto.isPF ?? dto.pessoaFisica ?? !dto.nomeRazaoSocial;
  const ultimaAtualizacaoIso = processo?.ultimaAtualizacao || dto.ultimaAtualizacao || null;
  const lastSyncDate = ultimaAtualizacaoIso ? formatarDataHoraCompleta(ultimaAtualizacaoIso) : "-";
  const processoId = dto.id;

  return {
    id: dto.id,
    type: isPF ? "PF" : "PJ",
    name: isPF ? nome : dto.nomeContato || nome,
    companyName: isPF ? null : dto.nomeRazaoSocial || nome,
    cnpj: dto.cnpj || "",
    contactRole: dto.contactRole || null,
    email: dto.email || "—",
    phone: dto.telefone || "—",
    state: dto.estado || "—",
    description: dto.descricao || dto.descricaoCaso || "",
    processNumber: dto.numeroProcesso || processo?.numeroProcesso || processo?.numeroCnj || "",
    createdAt,
    status,
    aceitouTermos: dto.aceitouTermos,
    dataResposta,
    processo,
    processoId,
    lastSyncDate,
    filingDate: formatarData(processo?.dataAjuizamento || processo?.dataDistribuicao),
    instance: processo?.instancia || null,
    secrecyLevel: processo?.nivelSigilo || null,
    tribunalSystem: processo?.sistemaTribunal || null,
    judgingBody: processo?.orgaoJulgador || null,
    processualClass: processo?.classeProcessual || null,
    raw: dto,
  };
}
/**
 * Envia uma nova solicitação/dúvida a partir do formulário público.
 *
 * @param {Object} dados Objeto compatível com SolicitacaoDuvidaCriacaoRequest
 * @returns {Promise<any>}
 */
export const criarSolicitacao = async (dados) => {
  try {
    const response = await api.post("/solicitacoes", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};
