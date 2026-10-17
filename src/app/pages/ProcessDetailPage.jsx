import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Clock,
  Plus,
  Scale,
  AlertTriangle,
  Flag,
  RotateCcw,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import {
  StatusBadge,
  PriorityBadge,
  PhaseBadge,
} from "../components/StatusBadge";
import { InfoRow } from "../components/InfoRow";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { CalendarEventModal } from "../components/CalendarEventModal";
import { getDocVariant } from "../utils/document";
import { formatLabel } from "../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  buscarProcessoPorId,
  listarDocumentosDoProcesso,
  atualizarDadosProcesso,
  atualizarProcesso,
  excluirProcesso,
  listarHistoricoDoProcesso,
  listarTiposDocumento,
  enviarDocumentosDoCliente,
  adicionarObservacaoAoProcesso,
  separarObservacoes,
  juntarObservacoes,
  SEPARADOR_OBSERVACAO,
  MAX_OBSERVACOES,
  MAX_CARACTERES_OBSERVACAO,
} from "../services/processoService";
import { maskCNJ } from "../utils/masks";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/permissions";
import "../../styles/process-detail-page.css";

/* ─ helpers ─ */
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

const historyDotClass = {
  abertura: "proc-timeline__dot--abertura",
  fechamento: "proc-timeline__dot--fechamento",
  mudanca_status: "proc-timeline__dot--mudanca_status",
  observacao: "proc-timeline__dot--observacao",
  arquivo: "proc-timeline__dot--arquivo",
};

// Histórico: quantos itens aparecem de início e quantos a mais a cada "Ver mais".
const HISTORY_INITIAL = 5;
const HISTORY_STEP = 10;

// O separador interno das observações não pode ser digitado pelo usuário,
// senão uma observação viraria duas ao salvar.
const limparObservacao = (texto) =>
  texto.split(SEPARADOR_OBSERVACAO.trim()).join(" ").trim();
function montarDefaultsCalendario(process) {
  const iso = process.raw?.dataAudiencia;
  const defaults = {
    title: `${iso ? "Audiência" : "Compromisso"} - ${process.clientName}`,
    description: [
      `Processo: ${maskCNJ(process.cnj) || "-"}`,
      process.tribunal && process.tribunal !== "-"
        ? `Tribunal: ${process.tribunal}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };

  if (iso) {
    const [data, hora] = iso.split("T");
    const inicio = (hora || "09:00").slice(0, 5);
    const [h, m] = inicio.split(":").map(Number);
    const fim =
      h >= 23
        ? "23:59"
        : `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    Object.assign(defaults, {
      startDate: data,
      endDate: data,
      startTime: inicio,
      endTime: fim,
    });
  }
  return defaults;
}

export default function ProcessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEditProcess = hasPermission(user, "EDITAR PROCESSO");
  const canDeleteProcess = hasPermission(user, "EXCLUIR PROCESSO");
  const canCreateDocument = hasPermission(user, "CRIAR DOCUMENTO");

  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reactivateDialog, setReactivateDialog] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [status, setStatus] = useState("ativo");
  const [observationsText, setObservationsText] = useState("");
  const [documents, setDocuments] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [historyVisible, setHistoryVisible] = useState(HISTORY_INITIAL);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const [dados, docs, historico] = await Promise.all([
          buscarProcessoPorId(id),
          listarDocumentosDoProcesso(id),
          listarHistoricoDoProcesso(id),
        ]);

        setProcess({ ...dados, history: historico });
        setStatus(dados.status);
        setObservationsText(dados.observationsText);
        setDocuments(docs);
        setHistoryVisible(HISTORY_INITIAL);
        document.title = `SGPJ | Processo - ${dados.clientName}`;
      } catch (err) {
        console.error("Erro ao carregar processo:", err);
        if (err.response?.status === 401) {
          toast.warning("Sessão inválida ou expirada.");
        } else if (err.response?.status === 404) {
          toast.error("Processo não encontrado.");
        } else {
          toast.error("Não foi possível carregar os dados do processo.");
        }
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  useEffect(() => {
    async function carregarTiposDocumento() {
      try {
        setTiposDocumento(await listarTiposDocumento());
      } catch (err) {
        console.error("Erro ao carregar tipos de documento:", err);
        toast.error("Não foi possível carregar os tipos de documento.");
      }
    }

    carregarTiposDocumento();
  }, []);

  const handleAtualizarDados = async () => {
    try {
      setSyncing(true);
      const dadosAtualizados = await atualizarDadosProcesso(id);
      const historico = await listarHistoricoDoProcesso(id);
      setProcess({ ...dadosAtualizados, history: historico });
      setStatus(dadosAtualizados.status);
      setObservationsText(dadosAtualizados.observationsText);
      toast.success("Dados do processo atualizados com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar dados do processo:", err);
      if (err.response?.status === 401) {
        toast.warning("Sessão inválida ou expirada.");
      } else if (err.response?.status === 503 || err.response?.status === 502 || err.response?.status === 504) {
        const mensagemErro = err.response?.data?.message || "Não foi possível obter dados oficiais do DataJud no momento. Por favor, tente novamente mais tarde.";
        toast.warning(mensagemErro);
      } else {
        const mensagemErro = err.response?.data?.message || "Não foi possível atualizar os dados do processo.";
        toast.error(mensagemErro);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await excluirProcesso(id);
      toast.success("Processo excluído com sucesso.");
      navigate("/app/inicio");
    } catch (err) {
      console.error("Erro ao excluir processo:", err);
      if (err.response?.status === 401) {
        toast.warning("Sessão inválida ou expirada.");
      } else {
        const mensagemErro = err.response?.data?.message || "Não foi possível excluir o processo.";
        toast.error(mensagemErro);
      }
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  /**
   * Chamado pelo modal de upload. `items` = [{ file, tipoId }].
   * O serviço envia um tipo por chamada, então agrupamos por tipo.
   * - Tudo falhou  -> lança erro (o modal continua aberto, com os arquivos, para tentar de novo).
   * - Falha parcial -> avisa quantos foram e fecha o modal (reenviar de novo duplicaria os que já foram).
   */
  const handleUploadDocuments = async (items) => {
    if (!process?.raw?.clienteId) {
      throw new Error("Este processo não possui um cliente vinculado.");
    }

    const grupos = new Map();
    items.forEach(({ file, tipoId }) => {
      const chave = String(tipoId);
      grupos.set(chave, [...(grupos.get(chave) || []), file]);
    });

    let enviados = 0;
    let falha = null;
    let listaAtualizada = true;

    setUploadingDocuments(true);
    try {
      for (const [tipoId, arquivos] of grupos) {
        try {
          await enviarDocumentosDoCliente({
            arquivos,
            tipoDocumentoId: Number(tipoId),
            clienteId: process.raw.clienteId,
            processoAppId: Number(id),
          });
          enviados += arquivos.length;
        } catch (err) {
          console.error("Erro ao enviar documentos:", err);
          falha = err;
          break;
        }
      }

      if (enviados > 0) {
        try {
          const [docs, historico] = await Promise.all([
            listarDocumentosDoProcesso(id),
            listarHistoricoDoProcesso(id),
          ]);
          setDocuments(docs);
          setProcess((prev) => ({ ...prev, history: historico }));
        } catch (err) {
          console.error("Erro ao atualizar lista de documentos:", err);
          listaAtualizada = false;
          toast.warning(
            "Documentos enviados, mas não foi possível atualizar a lista. Recarregue a página.",
          );
        }
      }

      if (falha) {
        const mensagem =
          falha.response?.data?.message ||
          "Não foi possível enviar os documentos.";
        if (enviados === 0) throw new Error(mensagem);
        toast.warning(
          `${enviados} de ${items.length} arquivo(s) enviado(s). ${mensagem}`,
        );
        return;
      }

      if (listaAtualizada) {
        toast.success(
          items.length === 1
            ? "Documento enviado com sucesso."
            : "Documentos enviados com sucesso.",
        );
      }
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleReactivate = async () => {
    const raw = process.raw;
    const payload = {
      numeroCnj: raw.processoApi?.numeroCnj || raw.numeroProcesso || null,
      descricaoCaso: raw.descricaoCaso,
      observacao: raw.obervacao || null,
      prioridadeId: raw.prioridade?.id,
      faseProcessoId: raw.faseProcesso?.id,
      siglaTribunalId: raw.siglaTribunal?.id,
      dataAudiencia: raw.dataAudiencia || null,
      valorCausa: raw.valorCausa ?? null,
      status: "ATIVO",
    };

    try {
      setReactivating(true);
      await atualizarProcesso(id, payload);
      const processoReativado = await buscarProcessoPorId(id);
      const historico = await listarHistoricoDoProcesso(id);
      setProcess({ ...processoReativado, history: historico });
      setStatus(processoReativado.status);
      setObservationsText(processoReativado.observationsText);
      toast.success("Processo reativado com sucesso.");
      setReactivateDialog(false);
    } catch (err) {
      console.error("Erro ao reativar processo:", err);
      toast.error(
        err.response?.data?.message || "Não foi possível reativar o processo.",
      );
    } finally {
      setReactivating(false);
    }
  };

  const handleAddComment = async () => {
    const trimmed = limparObservacao(newComment);
    if (!trimmed) return;

    const atuais = separarObservacoes(observationsText);
    if (atuais.length >= MAX_OBSERVACOES) {
      toast.warning(
        `Limite de ${MAX_OBSERVACOES} observações por processo atingido.`,
      );
      return;
    }
    if (trimmed.length > MAX_CARACTERES_OBSERVACAO) {
      toast.warning(
        `Cada observação pode ter no máximo ${MAX_CARACTERES_OBSERVACAO} caracteres.`,
      );
      return;
    }

    try {
      setSavingComment(true);
      await adicionarObservacaoAoProcesso({
        processoId: Number(id),
        processo: process,
        observacao: juntarObservacoes([...atuais, trimmed]),
      });
      const [dadosAtualizados, historico] = await Promise.all([
        buscarProcessoPorId(id),
        listarHistoricoDoProcesso(id),
      ]);
      setProcess({ ...dadosAtualizados, history: historico });
      setObservationsText(dadosAtualizados.observationsText);
      setNewComment("");
      setIsAddingComment(false);
      toast.success("Observação adicionada com sucesso.");
    } catch (err) {
      console.error("Erro ao adicionar observação:", err);
      const mensagemErro =
        err.response?.data?.message ||
        (err.response?.data?.errors && Object.values(err.response.data.errors)[0]) ||
        "Não foi possível adicionar a observação.";
      toast.error(mensagemErro);
    } finally {
      setSavingComment(false);
    }
  };

  const handleCancelComment = () => {
    setNewComment("");
    setIsAddingComment(false);
  };

  if (loading) {
    return (
      <div className="proc-detail-empty">
        <Loader2 size={28} className="animate-spin" />
        <p className="proc-detail-empty__text">Carregando processo...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="proc-detail-empty">
        <Scale size={36} className="proc-detail-empty__icon" />
        <p className="proc-detail-empty__text">Processo não encontrado.</p>
        <button
          onClick={() => navigate("/app/inicio")}
          className="proc-detail-empty__btn"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const isClosed = status === "encerrado";
  const isSuspended = status === "suspenso";
  const closedAt =
    process.closedAt ||
    process.encerradoEm ||
    process.history?.find((h) => h.type === "fechamento")?.timestamp ||
    "—";
  const closedBy =
    process.closedBy ||
    process.encerradoPor ||
    process.responsible ||
    "Thauany Bezerra";

  // Observações
  const observacoes = separarObservacoes(observationsText);
  const limiteObservacoesAtingido = observacoes.length >= MAX_OBSERVACOES;
  const comentarioPerto = newComment.length >= MAX_CARACTERES_OBSERVACAO * 0.9;

  // Histórico: mais recente primeiro, com limite de exibição
  const historicoOrdenado = [...(process.history || [])].reverse();
  const historicoVisivel = historicoOrdenado.slice(0, historyVisible);
  const historicoRestante = historicoOrdenado.length - historicoVisivel.length;

  return (
    <div className="proc-detail-page">
      <div className="proc-hero">
        <div className="proc-hero__top">
          <button
            onClick={() => navigate("/app/inicio")}
            className="proc-hero__back"
          >
            <ArrowLeft size={15} />
            Início
          </button>
          <button
            type="button"
            onClick={() => setCalendarModalOpen(true)}
            className="proc-hero__calendar-btn"
          >
            <Calendar size={16} />
            <span className="proc-hero__calendar-label--long">
              Gerar evento de calendário
            </span>
          </button>
        </div>

        <div className="proc-hero__deco" />
        <p className="proc-hero__cnj">{maskCNJ(process.cnj) || "-"}</p>
        <h1 className="proc-hero__name">{process.clientName}</h1>
        <div className="proc-hero__badges">
          <StatusBadge status={status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
          <span className="proc-hero__tribunal">{process.tribunal}</span>
        </div>
      </div>

      <div className="proc-content">
        <div className="proc-card">
          <div className="proc-sync-bar">
            <div className="proc-sync-bar__info">
              <span className="proc-sync-bar__label">
                Última busca de dados:
              </span>
              <span className="proc-sync-bar__value">
                {process.lastSyncDate}
              </span>
            </div>
            <button
              type="button"
              className="proc-sync-bar__btn"
              title="Buscar e atualizar dados do processo"
              onClick={handleAtualizarDados}
              disabled={syncing}
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Atualizando..." : "Atualizar dados"}</span>
            </button>
          </div>

          <div className="proc-grid">
            <InfoRow
              label="Fase"
              value={formatLabel(process.phase)}
              variant="proc"
            />
            <InfoRow label="Tribunal" value={process.tribunal} variant="proc" />
            <InfoRow
              label="Data ajuizamento"
              value={process.filingDate}
              variant="proc"
            />
            <InfoRow
              label="Instância"
              value={process.instance}
              variant="proc"
            />
            <InfoRow
              label="Nível de Sigilo"
              value={process.secrecyLevel}
              variant="proc"
            />
            <InfoRow
              label="Classe processual"
              value={process.processualClass}
              variant="proc"
            />
            <InfoRow label="Assunto" value={process.subject} variant="proc" />
          </div>
          <div className="proc-grid proc-grid--bordered">
            <div className="proc-grid__full">
              <InfoRow
                label="Órgão Julgador"
                value={process.judgingBody}
                variant="proc"
              />
            </div>
            <InfoRow
              label="Sistema do Tribunal"
              value={process.tribunalSystem}
              variant="proc"
            />
            <InfoRow
              label="Responsável"
              value={process.responsible}
              variant="proc"
            />
            <InfoRow
              label="Valor da causa"
              value={fmt(process.value)}
              mono
              variant="proc"
            />
            <InfoRow
              label="Data da audiência"
              value={
                process.hearingDate && process.hearingDate !== "—"
                  ? `${process.hearingDate}${process.hearingTime ? ` às ${process.hearingTime}` : ""}`
                  : "Não definida"
              }
              variant="proc"
            />
            <div className="proc-grid__full">
              <InfoRow
                label="Último movimento"
                value={
                  process.lastMovement
                    ? `${process.lastMovement.description} - ${process.lastMovement.timestamp}`
                    : "-"
                }
                variant="proc"
              />
            </div>
            {isClosed && (
              <>
                <InfoRow label="Encerrado em" value={closedAt} variant="proc" />
                <InfoRow
                  label="Encerrado por"
                  value={closedBy}
                  variant="proc"
                />
              </>
            )}
          </div>
        </div>

        <div className="proc-card">
          <h3 className="proc-card__title">
            <FileText size={14} className="proc-card__title-icon" />
            Descrição
          </h3>
          <p className="proc-card__text">{process.description}</p>
        </div>

        {/* ── Observações ── */}
        <div className="proc-card">
          <div className="proc-card__header">
            <h3 className="proc-card__title">
              <AlertTriangle size={14} className="proc-card__title-icon" />
              Observações
              <span className="proc-card__count">
                {observacoes.length}/{MAX_OBSERVACOES}
              </span>
            </h3>
            {!isClosed && !isAddingComment && (
              <button
                onClick={() => setIsAddingComment(true)}
                className="proc-card__action-btn"
                disabled={limiteObservacoesAtingido}
                title={
                  limiteObservacoesAtingido
                    ? `Limite de ${MAX_OBSERVACOES} observações atingido`
                    : undefined
                }
              >
                <Plus size={12} />
                {limiteObservacoesAtingido
                  ? "Limite atingido"
                  : "Adicionar comentário"}
              </button>
            )}
          </div>

          {observacoes.length > 0 ? (
            <div className="proc-obs-list">
              {observacoes.map((observacao, index) => (
                <div key={`${observacao}-${index}`} className="proc-obs-item">
                  <p className="proc-obs-item__text">{observacao}</p>
                </div>
              ))}
            </div>
          ) : !isAddingComment ? (
            <p className="proc-obs-empty">Nenhuma observação cadastrada.</p>
          ) : null}

          {isAddingComment && (
            <div className="proc-obs-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Digite o comentário..."
                className="proc-obs-textarea"
                rows={3}
                maxLength={MAX_CARACTERES_OBSERVACAO}
                autoFocus
              />
              <div className="proc-obs-form__meta">
                <span>Máx. {MAX_CARACTERES_OBSERVACAO} caracteres</span>
                <span
                  className={`proc-obs-form__counter ${comentarioPerto ? "proc-obs-form__counter--warn" : ""}`}
                >
                  {newComment.length}/{MAX_CARACTERES_OBSERVACAO}
                </span>
              </div>
              <div className="proc-obs-form__actions">
                <button
                  type="button"
                  onClick={handleCancelComment}
                  className="proc-obs-btn proc-obs-btn--cancel"
                  disabled={savingComment}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || savingComment}
                  className="proc-obs-btn proc-obs-btn--submit"
                >
                  {savingComment ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Histórico ── */}
        <div className="proc-card">
          <h3 className="proc-card__title">
            <Clock size={14} className="proc-card__title-icon" />
            Histórico
          </h3>

          {historicoOrdenado.length === 0 ? (
            <p className="proc-obs-empty">Nenhum registro no histórico.</p>
          ) : (
            <>
              <div className="proc-timeline">
                <div className="proc-timeline__line" />
                <div className="proc-timeline__items">
                  {historicoVisivel.map((item) => {
                    const isPhaseChange =
                      item.type === "mudanca_status" &&
                      (item.description.toLowerCase().includes("fase") ||
                        item.description
                          .toLowerCase()
                          .includes("mudança de fase"));
                    return (
                      <div key={item.id} className="proc-timeline__item">
                        {isPhaseChange ? (
                          <div className="proc-timeline__dot proc-timeline__dot--phase">
                            <Flag
                              size={12}
                              className="proc-timeline__dot-flag"
                              fill="white"
                            />
                          </div>
                        ) : (
                          <div
                            className={`proc-timeline__dot ${historyDotClass[item.type] ?? "proc-timeline__dot--default"}`}
                          />
                        )}
                        <p
                          className={`proc-timeline__desc ${isPhaseChange ? "proc-timeline__desc--bold" : ""}`}
                        >
                          {item.description}
                        </p>
                        <p className="proc-timeline__date">
                          {item.timestamp}
                          {item.user && (
                            <>
                              {" - "}
                              <span
                                className="proc-timeline__user"
                                title={item.userFull || item.user}
                              >
                                {item.user}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {historicoOrdenado.length > HISTORY_INITIAL && (
                <div className="proc-timeline__more-wrap">
                  {historicoRestante > 0 ? (
                    <button
                      type="button"
                      className="proc-timeline__more"
                      onClick={() => setHistoryVisible((v) => v + HISTORY_STEP)}
                    >
                      <ChevronDown size={14} />
                      Ver mais ({historicoRestante}{" "}
                      {historicoRestante === 1 ? "restante" : "restantes"})
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="proc-timeline__more"
                      onClick={() => setHistoryVisible(HISTORY_INITIAL)}
                    >
                      <ChevronUp size={14} />
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Documentos ── */}
        <div className="proc-card">
          <div className="proc-card__header">
            <h3 className="proc-card__title">
              <FileText size={14} className="proc-card__title-icon" />
              Documentos
            </h3>
          </div>

          {documents.length === 0 ? (
            !isClosed ? (
              <button
                type="button"
                className="proc-doc-empty"
                onClick={() => canCreateDocument && setUploadModalOpen(true)}
                disabled={uploadingDocuments || !canCreateDocument}
                title={canCreateDocument ? "Adicionar arquivo" : "Sem permissão para criar documento"}
              >
                <Plus size={20} className="proc-doc-empty__icon" />
                <p className="proc-doc-empty__text">Adicionar arquivo</p>
              </button>
            ) : (
              <p className="proc-obs-empty">Nenhum documento cadastrado.</p>
            )
          ) : (
            <div className="proc-doc-grid">
              {documents.map((doc) => {
                const variant = getDocVariant(doc.type);
                const content = (
                  <>
                    <div
                      className={`proc-doc-card__type proc-doc-card__type--${variant}`}
                    >
                      <span className="proc-doc-card__type-label">
                        {doc.type}
                      </span>
                    </div>
                    <p className="proc-doc-card__name" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="proc-doc-card__date">
                      {doc.type} - {doc.uploadedAt}
                    </p>
                  </>
                );

                return (
                  <div key={doc.id} className="proc-doc-card">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="proc-doc-card__link"
                        title={`Abrir ${doc.name}`}
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
              {!isClosed && (
                <button
                  type="button"
                  className="proc-doc-add"
                  onClick={() => canCreateDocument && setUploadModalOpen(true)}
                  disabled={uploadingDocuments || !canCreateDocument}
                  title={canCreateDocument ? "Adicionar arquivo" : "Sem permissão para criar documento"}
                >
                  <Plus size={20} className="proc-doc-add__icon" />
                  <p className="proc-doc-add__label">Adicionar arquivo</p>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="proc-actions">
          {isSuspended && (
            <button
              onClick={() => setReactivateDialog(true)}
              className="proc-actions__btn proc-actions__btn--reactivate"
            >
              <RotateCcw size={15} />
              Reativar Processo
            </button>
          )}
          {!isClosed && !isSuspended && (
            <button
              onClick={() => canEditProcess && navigate(`/app/processos/${id}/editar`)}
              className="proc-actions__btn proc-actions__btn--primary"
              disabled={!canEditProcess}
              title={canEditProcess ? "Editar Processo" : "Sem permissão para editar processo"}
            >
              <Pencil size={15} />
              Editar Processo
            </button>
          )}
          <button
            onClick={() => canDeleteProcess && setDeleteDialog(true)}
            className="proc-actions__btn proc-actions__btn--danger"
            disabled={!canDeleteProcess}
            title={canDeleteProcess ? "Excluir" : "Sem permissão para excluir processo"}
          >
            <Trash2 size={15} />
            Excluir
          </button>
        </div>
      </div>

      {/* Modal de upload: tipo -> arquivos -> confirmar (já avisa do OneDrive) */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        tiposDocumento={tiposDocumento}
        onConfirm={handleUploadDocuments}
        note="Os arquivos serão salvos e sincronizados no OneDrive vinculado a este processo."
      />

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="proc-dialog">
          <DialogHeader>
            <DialogTitle className="proc-dialog__title">
              Excluir processo?
            </DialogTitle>
          </DialogHeader>
          <p className="proc-dialog__text">
            Esta ação é irreversível. Todos os dados do processo serão removidos
            permanentemente.
          </p>
          <DialogFooter className="proc-dialog__footer">
            <button
              className="proc-dialog__btn proc-dialog__btn--outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              className="proc-dialog__btn proc-dialog__btn--danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateDialog} onOpenChange={setReactivateDialog}>
        <DialogContent className="proc-dialog">
          <DialogHeader>
            <DialogTitle className="proc-dialog__title">
              Reativar processo?
            </DialogTitle>
          </DialogHeader>
          <p className="proc-dialog__text">
            O processo será marcado novamente como ativo no sistema. Deseja
            continuar?
          </p>
          <DialogFooter className="proc-dialog__footer">
            <button
              className="proc-dialog__btn proc-dialog__btn--outline"
              onClick={() => setReactivateDialog(false)}
              disabled={reactivating}
            >
              Cancelar
            </button>
            <button
              className="proc-dialog__btn proc-dialog__btn--reactivate"
              onClick={handleReactivate}
              disabled={reactivating}
            >
              {reactivating ? "Reativando..." : "Reativar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CalendarEventModal
        open={calendarModalOpen}
        onOpenChange={setCalendarModalOpen}
        defaultValues={montarDefaultsCalendario(process)}
      />
    </div>
  );
}
