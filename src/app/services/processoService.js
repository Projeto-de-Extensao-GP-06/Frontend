import { api } from "@/app/provider/api";
import { maskCNJ, maskCPF, maskCNPJ } from "../utils/masks";
import { abreviarNome } from "../utils/format";

function formatarData(dataIso) {
  if (!dataIso) return "—";
  const [data] = dataIso.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(dataIso) {
  if (!dataIso) return { data: "—", hora: null };
  const [data, horaCompleta] = dataIso.split("T");
  const [ano, mes, dia] = data.split("-");
  const hora = horaCompleta ? horaCompleta.slice(0, 5) : null;
  return { data: `${dia}/${mes}/${ano}`, hora };
}

function formatarDataHoraCompleta(dataIso) {
  const { data, hora } = formatarDataHora(dataIso);
  return hora ? `${data} às ${hora}` : data;
}

function formatarCnj(numeroCnj) {
  return numeroCnj ? maskCNJ(numeroCnj) : "-";
}

function normalizarTexto(valor) {
  if (!valor) return "-";
  const texto = String(valor).trim().toLocaleLowerCase("pt-BR");
  return texto.replace(/(^|[\s-])\S/g, (letra) => letra.toLocaleUpperCase("pt-BR"));
}

function mapearTipoHistorico(nome) {
  if (!nome) return "observacao";
  const n = nome.toLowerCase();
  if (n.includes("abertura") || n.includes("criação") || n.includes("criacao")) return "abertura";
  if (n.includes("encerr") || n.includes("fecham")) return "fechamento";
  if (n.includes("status")) return "mudanca_status";
  if (n.includes("arquivo") || n.includes("document")) return "arquivo";
  return "observacao";
}

function mapearHistorico(historico) {
  return (Array.isArray(historico) ? [...historico] : [])
    .sort((a, b) => new Date(a.dataHoraAlteracao) - new Date(b.dataHoraAlteracao))
    .map((h) => {
    const dataHora = formatarDataHora(h.dataHoraAlteracao);
    const nomeUsuario = h.usuarioUtilizadoNome || null;
    return {
      id: h.historicoProcessoId,
      type: mapearTipoHistorico(h.tipoAlteracaoNome),
      description: h.descricaoAlteracao,
      timestamp: dataHora.hora ? `${dataHora.hora} ${dataHora.data}` : dataHora.data,
      userName: h.usuarioUtilizadoNome || "Usuário não informado",
      userFull: nomeUsuario,
      user: abreviarNome(nomeUsuario),
    };
  });
}

// Transforma a resposta crua da API (ProcessoAppResponse) no formato que a tela usa.
// Usada tanto no carregamento inicial quanto depois de "Atualizar dados".
export function mapearProcesso(p) {
  const audiencia = formatarDataHora(p.dataAudiencia);
  const ajuizamento = formatarDataHora(p.processoApi?.dataAjuizamento);
  const encerramento = formatarDataHora(p.encerradoSuspensoEm);
  const ultimaAtualizacao = formatarDataHora(p.ultimaAtualizacao);

  return {
    id: p.id,
    cnj: formatarCnj(p.processoApi?.numeroCnj || p.numeroProcesso),
    clientName: p.clientNomeRazaoSocial || "Sem nome",
    tribunal: (p.siglaTribunal?.siglaTribunal || p.siglaTribunal?.nome)?.toUpperCase() || "-",
    status: p.status ? p.status.trim().toLowerCase() : "ativo",
    priority: p.prioridade?.nome ? p.prioridade.nome.trim().toLowerCase() : "baixa",
    phase: normalizarTexto(p.faseProcesso?.nome),
    description: p.descricaoCaso || "",
    observationsText: p.obervacao || "",
    responsible: p.usuarioResponsavelNome || "-",
    value: p.valorCausa ?? 0,
    hearingDate: audiencia.data,
    hearingTime: audiencia.hora,
    filingDate: ajuizamento.data,
    instance: p.processoApi?.instancia || "-",
    secrecyLevel: p.processoApi?.nivelSigilo ?? "-",
    processualClass: p.processoApi?.classeProcessual || "-",
    judgingBody: p.processoApi?.orgaoJulgador || "-",
    tribunalSystem: p.processoApi?.sistemaTribunal || "-",
    subject: p.processoApi?.assunto || "-",
    lastMovement: p.processoApi?.ultimoMovimento
      ? {
        description: p.processoApi.ultimoMovimento.descricao || "Movimentação sem descrição",
        timestamp: formatarDataHoraCompleta(p.processoApi.ultimoMovimento.dataHoraMovimentacao),
      }
      : null,
    closedAt: encerramento.data,
    closedBy: p.encerradoSuspensoPorUsuarioNome || "-",
    motivoStatusId:
      p.motivoStatusId ??
      p.motivoStatusProcessoId ??
      p.motivoStatus?.id ??
      p.motivoStatusProcesso?.id ??
      null,
    motivoStatus:
      p.motivoStatusNome ||
      p.motivoStatusProcessoNome ||
      p.motivoStatus?.nome ||
      p.motivoStatusProcesso?.nome ||
      (typeof p.motivoStatus === "string" ? p.motivoStatus : null) ||
      null,
    justificativa: p.justificativa || null,
    lastSyncDate: ultimaAtualizacao.hora ? `${ultimaAtualizacao.data} às ${ultimaAtualizacao.hora}` : ultimaAtualizacao.data,
    ultimaAtualizacaoIso: p.ultimaAtualizacao || null,
    history: mapearHistorico(p.historicoProcessoResponses),
    raw: p
  };
}

export async function listarProcessos(filtros = {}) {
  const params = {};
  if (filtros.query)       params.query = filtros.query;
  if (filtros.status && filtros.status !== "Todos") params.status = filtros.status;
  if (filtros.faseId)      params.faseId = filtros.faseId;
  if (filtros.tribunalId)  params.tribunalId = filtros.tribunalId;
  if (filtros.prioridadeId) params.prioridadeId = filtros.prioridadeId;
  if (filtros.audiencia && filtros.audiencia !== "Todos") params.audiencia = filtros.audiencia;
  if (filtros.page != null)    params.page = filtros.page;
  if (filtros.size != null)    params.size = filtros.size;
  if (filtros.sort)            params.sort = filtros.sort;

  const response = await api.get("/processos", { params });
  return response.data;
}

export async function listarClientesParaProcesso() {
  const response = await api.get("/clientes", {
    params: { excluirLead: true },
  });
  const clientes = Array.isArray(response.data) ? response.data : [];

  return clientes.map((cliente) => {
    const isPF = Boolean(cliente.isPF);
    const documento = cliente.cpfCnpj || "";
    return {
      id: cliente.id,
      name: cliente.nomeRazaoSocial || "Sem nome",
      type: isPF ? "PF" : "PJ",
      cpf: isPF ? maskCPF(documento) : undefined,
      cnpj: isPF ? undefined : maskCNPJ(documento),
      email: cliente.email || "—",
      contacts: cliente.email ? [{ email: cliente.email, isPrimary: true }] : [],
      status: (cliente.statusNome || "").trim().toLowerCase(),
    };
  });
}

export async function criarProcesso(payload) {
  const response = await api.post("/processos", payload);
  return response.data;
}

export async function buscarProcessoPorId(id) {
  const response = await api.get(`/processos/${id}`);
  return mapearProcesso(response.data);
}

export async function listarDocumentosDoProcesso(id) {
  const response = await api.get(`/processos/${id}/documentos`);
  return mapearDocumentos(response.data || []);
}

export async function listarHistoricoDoProcesso(id) {
  const response = await api.get(`/processo/${id}/historico`);
  return mapearHistorico(response.data);
}

function mapearDocumentos(documentos, caminhoDeArmazenamentoId) {
  return (Array.isArray(documentos) ? documentos : []).map((d) => {
    const partes = (d.nomeOriginal || d.nome || "").split(".");
    const ext = partes.length > 1 ? partes.pop().toUpperCase() : "DOC";
    const downloadUrl = d.onedriveUrlDownload || d.urlDownload || null;
    const viewUrl = d.onedriveUrlThumbnail || d.thumbnailUrl || downloadUrl || null;

    return {
      id: d.documentoId ?? d.id,
      name: d.nomeOriginal || d.nome || "Documento",
      type: d.tipoDocumentoNome || (ext.length > 5 ? ext.slice(0, 4) : ext),
      uploadedAt: formatarDataHoraCompleta(d.anexadoEm ?? d.dataHoraCriacao ?? d.criadoEm),
      url: viewUrl,
      downloadUrl: downloadUrl || viewUrl,
      caminhoDeArmazenamentoId,
    };
  });
}

export async function listarDocumentosDoCliente(clienteId) {
  const caminhosResponse = await api.get(`/documentos/cliente/${clienteId}/caminhos`);
  const caminhos = Array.isArray(caminhosResponse.data) ? caminhosResponse.data : [];
  const documentosPorCaminho = await Promise.all(caminhos.map(async (caminho) => {
    const response = await api.get("/documentos/por-caminho", {
      params: { caminhoDeArmazenamentoId: caminho.id },
    });
    return mapearDocumentos(response.data || [], caminho.id);
  }));

  return documentosPorCaminho.flat();
}

export async function excluirArquivoDoCliente(caminhoDeArmazenamentoId, nomeArquivo) {
  await api.delete("/api-onedrive/arquivo", {
    params: { caminhoDeArmazenamentoId, nomeArquivo },
  });
}

export async function listarTiposDocumento() {
  const response = await api.get("/documentos/tipos-documento");
  return Array.isArray(response.data) ? response.data : [];
}

export async function obterCaminhoDoCliente(clienteId) {
  const pastaResponse = await api.post("/api-onedrive/pasta", null, {
    params: { clienteId },
  });
  const caminhosResponse = await api.get(`/documentos/cliente/${clienteId}/caminhos`);
  const caminhos = Array.isArray(caminhosResponse.data) ? caminhosResponse.data : [];
  const caminho = caminhos.find((item) => item.caminho === pastaResponse.data?.caminho);

  if (!caminho) {
    throw new Error("Não foi possível localizar a pasta de documentos do cliente.");
  }

  return caminho.id;
}

export async function enviarDocumentosDoCliente({ arquivos, tipoDocumentoId, clienteId, processoAppId, caminhoDeArmazenamentoId: caminhoPreviamenteObtido }) {
  const caminhoDeArmazenamentoId = caminhoPreviamenteObtido || (await obterCaminhoDoCliente(clienteId));
  const resultados = [];
  for (const arquivo of (arquivos || [])) {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("tipoDocumentoId", tipoDocumentoId);
    formData.append("caminhoDeArmazenamentoId", caminhoDeArmazenamentoId);
    if (processoAppId) {
      formData.append("processoAppId", processoAppId);
    }
    const response = await api.post("/api-onedrive", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    resultados.push(response.data);
  }
  return resultados;
}

function montarPayloadExistente(raw, observacao) {
  return {
    numeroCnj: raw.processoApi?.numeroCnj || raw.numeroProcesso || null,
    descricaoCaso: raw.descricaoCaso,
    observacao,
    prioridadeId: raw.prioridade?.id,
    faseProcessoId: raw.faseProcesso?.id,

    dataAudiencia: raw.dataAudiencia || null,
    valorCausa: raw.valorCausa ?? null,
    status: raw.status,
    motivoStatusProcessoId: raw.motivoStatusId ?? undefined,
    justificativa: raw.justificativa || undefined,
  };
}

export async function adicionarObservacaoAoProcesso({ processoId, processo, observacao }) {
  await atualizarProcesso(processoId, montarPayloadExistente(processo.raw, observacao));
}

export async function atualizarDadosProcesso(id) {
  const response = await api.post(`/processos/${id}/atualizar-dados`);
  return response.data;
}

export async function excluirProcesso(id) {
  await api.delete(`/processos/${id}`);
}

export async function listarPrioridades() {
  const response = await api.get("/prioridades");
  const data = response.data;
  return Array.isArray(data) ? data : (data?.content || []);
}

export async function listarFases() {
  const response = await api.get("/fasesProcesso");
  const data = response.data;
  return Array.isArray(data) ? data : (data?.content || []);
}

export async function listarTribunais() {
  const response = await api.get("/siglaTribunais");
  const data = response.data;
  return Array.isArray(data) ? data : (data?.content || []);
}

export async function listarMotivosStatus() {
  const response = await api.get("/motivosStatusProcesso");
  const data = response.data;
  return Array.isArray(data) ? data : (data?.content || []);
}

export async function atualizarProcesso(id, payload) {
  const response = await api.put(`/processos/${id}`, payload);
  return response.data;
}

export async function buscarClientePorId(clienteId) {
  const response = await api.get(`/clientes/${clienteId}`);
  const c = response.data;
  return {
    id: c.id,
    name: c.nomeRazaoSocial,
    cpfCnpj: c.cpfCnpj,
    isPf: c.isPF,
    statusNome: c.status?.nome || "-",
    email: c.contatos?.find((ct) => ct.principal)?.email || c.contatos?.[0]?.email || "-",
  };
}
export const SEPARADOR_OBSERVACAO = " @#$%&* ";
export const MAX_OBSERVACOES = 20;
export const MAX_CARACTERES_OBSERVACAO = 500;

export function separarObservacoes(texto) {
  if (!texto?.trim()) {
    return [];
  }
  return texto
    .split(SEPARADOR_OBSERVACAO)
    .map((observacao) => observacao.trim())
    .filter(Boolean);
}

export function juntarObservacoes(observacoes) {
  return observacoes
    .map((observacao) => observacao.trim())
    .filter(Boolean)
    .join(SEPARADOR_OBSERVACAO);
}

export function conectarStatusSincronizacao(id, { onIniciado, onProcessando, onReprocessando, onConcluido, onError } = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const url = `${baseUrl}/processos/${id}/sincronizacao-status`;
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
      onConcluido?.({});
    } finally {
      eventSource.close();
    }
  });

  eventSource.onerror = (err) => {
    eventSource.close();
    onError?.(err);
  };

  return () => {
    eventSource.close();
  };
}

