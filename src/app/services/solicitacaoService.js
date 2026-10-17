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

export async function listarSolicitacoes({ page = 0, size = 20, sort, signal } = {}) {
  const query = montarQuery({ page, size, sort });
  const response = await api.get(`/solicitacoes?${query}`, { signal });
  return response.data;
}

export async function filtrarSolicitacoes({
  estado,
  pesquisa,
  dataInicio,
  dataFim,
  page = 0,
  size = 20,
  sort,
  signal,
} = {}) {
  const query = montarQuery({
    estado: estado?.trim(),
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

  return {
    id: dto.id,
    type: isPF ? "PF" : "PJ",
    name: nome,
    companyName: dto.nomeRazaoSocial || null,
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
  const response = await api.post("/solicitacoes", dados);
  return response.data;
};
