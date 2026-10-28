import { useNavigate, useParams } from "react-router";
import { ArrowLeft, X, Trash2, Save, CheckCircle, AlertTriangle, Loader2, Plus, CloudUpload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { ClientCard } from "../components/ClientCard";
import { maskCNJ, maskCPF, maskCNPJ, maskCurrency } from "../utils/masks";
import { getDocBadgeClass } from "../utils/document";
import {
  buscarProcessoPorId,
  atualizarProcesso,
  excluirProcesso,
  listarPrioridades,
  listarFases,
  listarTribunais,
  listarMotivosStatus,
  listarDocumentosDoCliente,
  excluirArquivoDoCliente,
  listarTiposDocumento,
  enviarDocumentosDoCliente,
  buscarClientePorId,
  separarObservacoes,
  juntarObservacoes,
  MAX_OBSERVACOES,
  MAX_CARACTERES_OBSERVACAO,
} from "../services/processoService";
import { toast } from "sonner";
import "../../styles/edit-process-page.css";
import "../../styles/clients-page.css";

/* ─ helpers ─ */

// "12/07/2026" -> "2026-07-12" (input type=date)
function parseDataBrParaInput(dataBr) {
  if (!dataBr || dataBr === "—") return "";
  const [d, m, y] = dataBr.split("/");
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// junta input type=date + input type=time num ISO pro backend
function montarDataHoraIso(dataInput, horaInput) {
  if (!dataInput || !horaInput) return null;
  const hora = horaInput || "00:00";
  return `${dataInput}T${hora}:00`;
}

export default function EditProcessPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [process, setProcess] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [cnj, setCnj] = useState("");
  const [hasExistingCnj, setHasExistingCnj] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsToDelete, setDocumentsToDelete] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [tipoDocumentoId, setTipoDocumentoId] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [prioridades, setPrioridades] = useState([]);
  const [fases, setFases] = useState([]);
  const [tribunais, setTribunais] = useState([]);
  const [motivos, setMotivos] = useState([]);

  // Observações: array local de strings, staged — só persiste no banco quando salvar o processo.
  // "Adicionar observação" só abre uma linha nova vazia; o texto de cada linha é editado direto ali.
  const [observacoesArray, setObservacoesArray] = useState([]);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [cnjConfirmDialogOpen, setCnjConfirmDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const cnjInputRef = useRef(null);

  // campos do formulário
  const [descricaoCaso, setDescricaoCaso] = useState("");
  const [prioridadeId, setPrioridadeId] = useState("");
  const [faseProcessoId, setFaseProcessoId] = useState("");
  const [siglaTribunalId, setSiglaTribunalId] = useState("");
  const [valorCausa, setValorCausa] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [audienciaError, setAudienciaError] = useState("");

  // campos usados só nos dialogs de encerrar/desativar
  const [motivoStatusProcessoId, setMotivoStatusProcessoId] = useState("");
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    document.title = "SGPJ | Editar Processo";
    async function carregar() {
      try {
        setLoading(true);
        const [dadosProcesso, dadosPrioridades, dadosFases, dadosTribunais, dadosMotivos] =
          await Promise.all([
            buscarProcessoPorId(id),
            listarPrioridades(),
            listarFases(),
            listarTribunais(),
            listarMotivosStatus(),
          ]);

        setProcess(dadosProcesso);
        setPrioridades(dadosPrioridades);
        setFases(dadosFases);
        setTribunais(dadosTribunais);
        setMotivos(dadosMotivos);

        const raw = dadosProcesso.raw;
        if (raw.clienteId) {
          setDocuments(await listarDocumentosDoCliente(raw.clienteId));
        }
        setDescricaoCaso(raw.descricaoCaso || "");
        setPrioridadeId(raw.prioridade?.id ?? "");
        setFaseProcessoId(raw.faseProcesso?.id ?? "");
        setSiglaTribunalId(raw.siglaTribunal?.id ?? "");
        setValorCausa(raw.valorCausa != null ? maskCurrency(raw.valorCausa) : "");
        setHearingDate(parseDataBrParaInput(dadosProcesso.hearingDate));
        setHearingTime(dadosProcesso.hearingTime || "");

        // CNJ: inicializa formatado com a máscara oficial CNJ e bloqueia edição caso já exista
        const rawCnj = raw.processoApi?.numeroCnj || raw.numeroProcesso || (dadosProcesso.cnj !== "-" ? dadosProcesso.cnj : "");
        const cnjFormatado = rawCnj ? maskCNJ(rawCnj) : "";
        setCnj(cnjFormatado);
        setHasExistingCnj(Boolean(rawCnj && String(rawCnj).replace(/\D/g, "").length > 0));

        // observações vêm como texto único (campo "obervacao", com o typo do banco) — separa em array pra exibir
        setObservacoesArray(separarObservacoes(raw.obervacao || ""));

        if (raw.clienteId) {
          try {
            const dadosCliente = await buscarClientePorId(raw.clienteId);
            const isPF = Boolean(dadosCliente.isPf ?? (dadosCliente.type === "PF" || !dadosCliente.cnpj));
            const rawDoc = dadosCliente.cpfCnpj || dadosCliente.cpf || dadosCliente.cnpj || "";
            const docFormatado = isPF ? maskCPF(rawDoc) : maskCNPJ(rawDoc);

            setSelectedClient({
              ...dadosCliente,
              id: dadosCliente.id,
              name: dadosCliente.name || dadosCliente.nomeRazaoSocial || dadosProcesso.clientName,
              type: isPF ? "PF" : "PJ",
              cpf: isPF ? docFormatado : undefined,
              cnpj: !isPF ? docFormatado : undefined,
              email: dadosCliente.email || "—",
              status: (dadosCliente.statusNome || dadosCliente.status || "ativo").toLowerCase(),
              contacts: dadosCliente.contacts || dadosCliente.contatos || [],
            });
          } catch (e) {
            console.error("Erro ao buscar cliente do processo:", e);
            if (dadosProcesso.clientName && dadosProcesso.clientName !== "Sem nome") {
              setSelectedClient({
                id: raw.clienteId,
                name: dadosProcesso.clientName,
                type: "PF",
                cpf: "—",
                email: "—",
                status: "ativo",
              });
            }
          }
        } else if (dadosProcesso.clientName && dadosProcesso.clientName !== "Sem nome") {
          setSelectedClient({
            id: null,
            name: dadosProcesso.clientName,
            type: "PF",
            cpf: "—",
            email: "—",
            status: "ativo",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados de edição:", err);
        if (err.response?.status === 401) {
          toast.warning("Sessão inválida ou expirada.");
        } else if (err.response?.status === 404) {
          toast.error("Processo não encontrado.");
        } else {
          toast.error("Não foi possível carregar os dados para edição.");
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
        const tipos = await listarTiposDocumento();
        setTiposDocumento(tipos);
      } catch (err) {
        console.error("Erro ao carregar tipos de documento:", err);
        toast.error("Não foi possível carregar os tipos de documento.");
      }
    }

    carregarTiposDocumento();
  }, []);

  if (loading) {
    return (
      <div className="edit-process-page edit-process-page--empty">
        <Loader2 size={28} className="animate-spin" />
        <p className="edit-process-empty-text">Carregando processo...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="edit-process-page edit-process-page--empty">
        <p className="edit-process-empty-text">Processo não encontrado.</p>
        <Button onClick={() => navigate("/app/inicio")} className="edit-process-empty-button">
          Voltar
        </Button>
      </div>
    );
  }

  if (process.status !== "ativo") {
    return (
      <div className="edit-process-page edit-process-page--empty">
        <p className="edit-process-empty-text">Somente processos ativos podem ser editados.</p>
        <Button onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-empty-button">
          Voltar ao Processo
        </Button>
      </div>
    );
  }

  // monta o payload base compartilhado por todos os tipos de salvamento.
  // juntarObservacoes já ignora sozinha linhas vazias ou só com espaços.
  function montarPayloadBase() {
    const payload = {
      descricaoCaso,
      observacao: juntarObservacoes(observacoesArray),
      prioridadeId: Number(prioridadeId),
      faseProcessoId: Number(faseProcessoId),
      dataAudiencia: montarDataHoraIso(hearingDate, hearingTime),
      valorCausa: valorCausa ? Number(valorCausa.replace(/\D/g, "")) / 100 : null,
      numeroCnj: cnj ? cnj.replace(/\D/g, "") : null,
    };
    return payload;
  }

  async function enviarAtualizacao(payload, mensagemSucesso, excluirDocumentos = false) {
    try {
      setSaving(true);
      await atualizarProcesso(id, payload);
      if (excluirDocumentos && documentsToDelete.length) {
        await Promise.all(documentsToDelete.map((document) =>
          excluirArquivoDoCliente(document.caminhoDeArmazenamentoId, document.name)
        ));
        setDocumentsToDelete([]);
      }
      toast.success(mensagemSucesso);
      navigate(`/app/processos/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar processo:", err);
      if (err.response?.status === 401) {
        toast.warning("Sessão inválida ou expirada.");
      } else {
        const mensagemErro =
          err.response?.data?.message ||
          (err.response?.data?.errors && Object.values(err.response.data.errors)[0]) ||
          "Não foi possível salvar as alterações.";
        toast.error(mensagemErro);
      }
    } finally {
      setSaving(false);
    }
  }

  const validarCnj = () => {
    if (!hasExistingCnj && cnj) {
      const cnjLimpo = cnj.replace(/\D/g, "");
      if (cnjLimpo.length !== 20) {
        toast.warning("O CNJ deve conter exatamente 20 dígitos numéricos (ou deixe em branco).");
        return false;
      }
    }
    return true;
  };

  const validarObservacoes = () => {
    if (observacoesArray.length > MAX_OBSERVACOES) {
      toast.warning(`O processo aceita no máximo ${MAX_OBSERVACOES} observações.`);
      return false;
    }
    if (observacoesArray.some((item) => item.trim().length > MAX_CARACTERES_OBSERVACAO)) {
      toast.warning(`Cada observação pode ter no máximo ${MAX_CARACTERES_OBSERVACAO} caracteres.`);
      return false;
    }
    return true;
  };

  const validarAudiencia = () => {
    if (hearingDate && !hearingTime) {
      const msg = "Informe o horário da audiência para a data preenchida.";
      setAudienciaError(msg);
      toast.warning(msg);
      return false;
    }
    if (hearingTime && !hearingDate) {
      const msg = "Informe a data da audiência para o horário preenchido.";
      setAudienciaError(msg);
      toast.warning(msg);
      return false;
    }
    setAudienciaError("");
    return true;
  };

  const handleSalvar = () => {
    if (!validarAudiencia()) {
      setSaveDialogOpen(false);
      setCnjConfirmDialogOpen(false);
      return;
    }
    if (!validarCnj()) {
      setSaveDialogOpen(false);
      setCnjConfirmDialogOpen(false);
      return;
    }
    if (!validarObservacoes()) {
      setSaveDialogOpen(false);
      setCnjConfirmDialogOpen(false);
      return;
    }
    const payload = { ...montarPayloadBase(), status: "ATIVO" };
    enviarAtualizacao(payload, "Processo atualizado com sucesso.", true);
    setSaveDialogOpen(false);
    setCnjConfirmDialogOpen(false);
  };

  const handleClickSalvarAlteracoes = () => {
    if (!validarCnj()) return;
    if (!validarAudiencia()) return;
    if (!validarObservacoes()) return;

    const informandoNovoCnj = !hasExistingCnj && Boolean(cnj && cnj.replace(/\D/g, "").length === 20);
    if (informandoNovoCnj) {
      setCnjConfirmDialogOpen(true);
    } else {
      setSaveDialogOpen(true);
    }
  };

  const handleEncerrar = () => {
    if (!validarAudiencia()) {
      setCloseDialogOpen(false);
      return;
    }
    if (!validarCnj()) {
      setCloseDialogOpen(false);
      return;
    }
    if (!validarObservacoes()) {
      setCloseDialogOpen(false);
      return;
    }
    if (!motivoStatusProcessoId) {
      toast.warning("Selecione o motivo do encerramento.");
      return;
    }
    const payload = {
      ...montarPayloadBase(),
      status: "ENCERRADO",
      motivoStatusProcessoId: Number(motivoStatusProcessoId),
      justificativa: justificativa || undefined,
    };
    enviarAtualizacao(payload, "Processo encerrado com sucesso.");
    setCloseDialogOpen(false);
  };

  const handleDesativar = () => {
    if (!validarAudiencia()) {
      setDeactivateDialogOpen(false);
      return;
    }
    if (!validarCnj()) {
      setDeactivateDialogOpen(false);
      return;
    }
    if (!validarObservacoes()) {
      setDeactivateDialogOpen(false);
      return;
    }
    if (!motivoStatusProcessoId) {
      toast.warning("Selecione o motivo da suspensão.");
      return;
    }
    const payload = {
      ...montarPayloadBase(),
      status: "SUSPENSO",
      motivoStatusProcessoId: Number(motivoStatusProcessoId),
      justificativa: justificativa || undefined,
    };
    enviarAtualizacao(payload, "Processo suspenso com sucesso.");
    setDeactivateDialogOpen(false);
  };

  const handleExcluir = async () => {
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

  // Observações: "Adicionar" só abre uma linha vazia; o texto é editado direto no input da linha;
  // tudo é persistido de uma vez quando o processo é salvo (nenhuma chamada de API por item).
  const handleAddObservacaoRow = () => {
    if (observacoesArray.length >= MAX_OBSERVACOES) {
      toast.warning(`Limite de ${MAX_OBSERVACOES} observações por processo atingido.`);
      return;
    }
    setObservacoesArray((prev) => [...prev, ""]);
  };

  const handleChangeObservacao = (index, value) => {
    setObservacoesArray((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const handleRemoverObservacaoLocal = (index) => {
    setObservacoesArray((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoverDocumentoLocal = (document) => {
    setDocuments((prev) => prev.filter((item) => item.id !== document.id));
    setDocumentsToDelete((prev) => prev.some((item) => item.id === document.id) ? prev : [...prev, document]);
  };

  const handleUploadDocumento = async (event) => {
    const arquivos = Array.from(event.target.files || []);
    event.target.value = "";

    if (!arquivos.length) return;
    if (!tipoDocumentoId) {
      toast.warning("Selecione o tipo de documento antes de enviar o arquivo.");
      return;
    }
    if (!process.raw.clienteId) {
      toast.error("Este processo não possui um cliente vinculado.");
      return;
    }

    try {
      setUploadingDocument(true);
      await enviarDocumentosDoCliente({
        arquivos,
        tipoDocumentoId: Number(tipoDocumentoId),
        clienteId: process.raw.clienteId,
        processoAppId: Number(id),
      });
      setDocuments(await listarDocumentosDoCliente(process.raw.clienteId));
      toast.success(arquivos.length === 1 ? "Documento enviado com sucesso." : "Documentos enviados com sucesso.");
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      toast.error(err.response?.data?.message || "Não foi possível enviar o documento.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const listaMotivos = Array.isArray(motivos) ? motivos : (motivos?.content || []);
  const motivosEncerramento = listaMotivos.filter((m) => m?.aplicavelA === "ENCERRADO" || m?.aplicavelA === "AMBOS");
  const motivosSuspensao = listaMotivos.filter((m) => m?.aplicavelA === "SUSPENSO" || m?.aplicavelA === "AMBOS");

  return (
    <div className="edit-process-page">
      <button onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-breadcrumb">
        <ArrowLeft size={14} />
        Processo
      </button>

      <div className="edit-process-header">
        <p className="edit-process-kicker">Início › Processo › Edição</p>
        <h1 className="edit-process-title">Editar Processo</h1>
        <p className="edit-process-subtitle">Edite os dados desejados do processo:</p>
      </div>

      <div className="edit-process-form">
        {/* CNJ */}
        <div className="edit-process-field">
          <Label className="edit-process-label" htmlFor="edit-process-cnj">
            Número CNJ
          </Label>
          {hasExistingCnj ? (
            <Label
              className="edit-process-input edit-process-input--mono edit-process-input-cadeado"
              style={{ fontSize: "0.875rem", fontWeight: "normal", padding: "0.2rem" }}
            >
              {cnj}
            </Label>
          ) : (
            <Input
              ref={cnjInputRef}
              id="edit-process-cnj"
              type="text"
              value={cnj}
              onChange={(event) => setCnj(maskCNJ(event.target.value))}
              placeholder="0000000-00.0000.0.00.0000"
              maxLength={25}
              className="edit-process-input edit-process-input--mono"
            />
          )}
        </div>

        {/* Cliente — somente leitura */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Cliente</Label>
          {selectedClient ? (
            <div className="selected-client-card-container">
              <ClientCard client={selectedClient} showChevron={false} />
            </div>
          ) : (
            <div className="edit-process-input" style={{ opacity: 0.6 }}>
              {process.clientName || "Cliente não informado"}
            </div>
          )}
        </div>

        {/* Prioridade + Fase */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Prioridade</Label>
            <select
              className="edit-process-select"
              value={prioridadeId}
              onChange={(e) => setPrioridadeId(e.target.value)}
            >
              <option value="" disabled>Selecione</option>
              {prioridades.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Fase</Label>
            <select
              className="edit-process-select"
              value={faseProcessoId}
              onChange={(e) => setFaseProcessoId(e.target.value)}
            >
              <option value="" disabled>Selecione</option>
              {fases.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tribunal */}
        <div className="edit-process-field">
          <Label className="edit-process-label" htmlFor="edit-process-tribunal">
            Sigla Tribunal
          </Label>
          <Label className="edit-process-input edit-process-input--mono edit-process-input-cadeado" style={{ fontSize: "0.875rem", fontWeight: "normal", padding: "0.2rem" }}>
            {tribunais.find(t => t.id === siglaTribunalId)?.siglaTribunal || process.raw?.siglaTribunal?.nome || "Tribunal não selecionado"}
          </Label>
        </div>

        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Assunto</Label>
            <Label className="edit-process-input edit-process-input--readonly edit-process-input-cadeado" style={{ fontSize: "0.875rem", fontWeight: "normal", padding: "0.2rem" }}>
              {process.subject}
            </Label>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Último movimento</Label>
            <Label className="edit-process-input edit-process-input--readonly edit-process-input-cadeado" style={{ fontSize: "0.875rem", fontWeight: "normal", padding: "0.2rem" }}>
              {process.lastMovement
                ? `${process.lastMovement.description} - ${process.lastMovement.timestamp}`
                : "Não informado"}
            </Label>
          </div>
        </div>

        {/* Valor + Data audiência */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Valor da causa</Label>
            <Input
              type="text"
              value={valorCausa}
              onChange={(e) => setValorCausa(maskCurrency(e.target.value))}
              placeholder="R$ 0,00"
              maxLength={26}
              className="edit-process-input edit-process-input--mono"
            />
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Data e hora da audiência</Label>
            <div className="edit-process-datetime-group">
              <Input
                type="date"
                value={hearingDate}
                onChange={(e) => {
                  setHearingDate(e.target.value);
                  if (audienciaError) setAudienciaError("");
                }}
                className="edit-process-input edit-process-input--mono"
              />
              <Input
                type="time"
                value={hearingTime}
                onChange={(e) => {
                  setHearingTime(e.target.value);
                  if (audienciaError) setAudienciaError("");
                }}
                className="edit-process-input edit-process-input--mono"
              />
            </div>
            {audienciaError && (
              <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
                {audienciaError}
              </p>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Descrição</Label>
          <Textarea
            value={descricaoCaso}
            onChange={(e) => setDescricaoCaso(e.target.value)}
            className="edit-process-textarea"
          />
        </div>

        {/* Observações — "Adicionar" só abre um campo novo vazio; o salvamento junta tudo que estiver preenchido */}
        <div className="edit-process-field">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.375rem",
            }}
          >
            <Label className="edit-process-label" style={{ marginBottom: 0 }}>
              Observações ({observacoesArray.length}/{MAX_OBSERVACOES})
            </Label>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Até {MAX_CARACTERES_OBSERVACAO} caracteres por observação
            </span>
          </div>
          <div className="edit-process-observation-list">
            {observacoesArray.map((texto, index) => (
              <div
                key={index}
                className="edit-process-observation-row"
                style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
                  <Input
                    value={texto}
                    onChange={(e) => handleChangeObservacao(index, e.target.value)}
                    placeholder="Digite a observação..."
                    maxLength={MAX_CARACTERES_OBSERVACAO}
                    className="edit-process-input edit-process-input--with-action"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoverObservacaoLocal(index)}
                    className="edit-process-remove-observation"
                    title="Remover observação"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "2.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: texto.length >= MAX_CARACTERES_OBSERVACAO ? "#ef4444" : "#94a3b8",
                    }}
                  >
                    {texto.length}/{MAX_CARACTERES_OBSERVACAO} caracteres
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddObservacaoRow}
            className="edit-process-add-observation"
            disabled={observacoesArray.length >= MAX_OBSERVACOES}
          >
            <Plus size={14} />
            Adicionar observação
          </button>
        </div>

        {/* Documentos pertencem ao cliente e só são excluídos do OneDrive ao salvar. */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Documentos</Label>
          <p className="edit-process-doc-hint">
            Os documentos são compartilhados entre os processos deste cliente. A exclusão será aplicada somente ao salvar as alterações.
          </p>
          <div className="edit-process-document-type">
            <Label className="edit-process-label" htmlFor="edit-process-document-type">
              Tipo do documento
            </Label>
            <select
              id="edit-process-document-type"
              className="edit-process-select"
              value={tipoDocumentoId}
              onChange={(event) => setTipoDocumentoId(event.target.value)}
              disabled={uploadingDocument}
            >
              <option value="">Selecione o tipo</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </select>
          </div>
          <div className="edit-process-doc-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="edit-process-doc-card">
                <button type="button" className="edit-process-remove-doc" onClick={() => handleRemoverDocumentoLocal(doc)} title="Excluir documento ao salvar" aria-label={`Excluir ${doc.name} ao salvar`}>
                  <X size={14} />
                </button>
                <div className={`edit-process-doc-badge ${getDocBadgeClass(doc.type)}`}>
                  {doc.type}
                </div>
                {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="edit-process-doc-name" title={`Abrir ${doc.name}`}>{doc.name}</a> : <p className="edit-process-doc-name" title={doc.name}>{doc.name}</p>}
                {doc.uploadedAt && (
                  <span className="edit-process-doc-date">{doc.type} - {doc.uploadedAt}</span>
                )}
              </div>
            ))}
            <label htmlFor="edit-process-file-upload" className="edit-process-doc-upload">
              <input
                id="edit-process-file-upload"
                type="file"
                multiple
                onChange={handleUploadDocumento}
                className="edit-process-file-input-hidden"
                disabled={uploadingDocument || !tiposDocumento.length}
              />
              {uploadingDocument ? <Loader2 size={18} className="edit-process-doc-upload-icon animate-spin" /> : <CloudUpload size={18} className="edit-process-doc-upload-icon" />}
              <p className="edit-process-doc-upload-text">
                {uploadingDocument ? "Enviando..." : "Adicionar arquivo"}
              </p>
            </label>
          </div>
          {!documents.length && <p className="edit-process-doc-empty">Nenhum documento disponível para este cliente.</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="edit-process-actions">
        <div className="edit-process-actions-row">
          <Button onClick={handleClickSalvarAlteracoes} className="edit-process-button edit-process-button--primary" disabled={saving}>
            <Save size={15} />
            Salvar Alterações
          </Button>
          <Button onClick={() => {
            if (!validarCnj()) return;
            if (!validarAudiencia()) return;
            setCloseDialogOpen(true);
          }} className="edit-process-button edit-process-button--close" disabled={saving}>
            <CheckCircle size={15} />
            Encerrar Processo
          </Button>
        </div>

        <div className="edit-process-actions-row">
          <Button className="edit-process-button edit-process-button--warn" onClick={() => {
            if (!validarCnj()) return;
            if (!validarAudiencia()) return;
            setDeactivateDialogOpen(true);
          }} disabled={saving}>
            <AlertTriangle size={15} className="edit-process-dialog__icon" />
            Suspender Processo
          </Button>
          <Button onClick={() => setDeleteDialog(true)} className="edit-process-button edit-process-button--danger" disabled={saving}>
            <Trash2 size={14} />
            Excluir Processo
          </Button>
        </div>

        <div className="edit-process-actions-row">
          <Button variant="outline" onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-button edit-process-button--outline">
            Cancelar
          </Button>
        </div>
      </div>

      {/* Modal: confirmar vinculação irreversível de CNJ */}
      <Dialog open={cnjConfirmDialogOpen} onOpenChange={setCnjConfirmDialogOpen}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <div className="edit-process-dialog__header">
              <div className="edit-process-dialog__icon-wrap">
                <AlertTriangle size={24} className="edit-process-dialog__icon" />
              </div>
              <DialogTitle className="edit-process-dialog-title">Confirmar número do CNJ?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            Esta ação <strong>não pode ser revertida</strong>. Uma vez vinculado ao processo, o número CNJ não poderá ser alterado ou removido. Revise o número informado:
          </p>
          <p className="edit-process-dialog-text" style={{ paddingTop: 0 }}>
            <strong className="edit-process-dialog__highlight" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95rem" }}>
              {cnj}
            </strong>
          </p>
          <DialogFooter className="edit-process-dialog-footer">
            <Button
              variant="outline"
              className="edit-process-dialog-button edit-process-dialog-button--outline"
              onClick={() => {
                setCnjConfirmDialogOpen(false);
                cnjInputRef.current?.focus?.();
              }}
              disabled={saving}
            >
              Revisar
            </Button>
            <Button
              className="edit-process-dialog-button edit-process-dialog-button--primary"
              onClick={handleSalvar}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Confirmar e Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: confirmar salvar alterações */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <div className="edit-process-dialog__header">
              <div className="edit-process-dialog__icon-wrap edit-process-dialog__icon-wrap--blue">
                <CheckCircle size={24} className="edit-process-dialog__icon" />
              </div>
              <DialogTitle className="edit-process-dialog-title">Confirmar alterações do processo</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            Deseja salvar as alterações realizadas no processo{" "}
            <strong className="edit-process-dialog__highlight">{cnj || process.cnj || id}</strong>?
          </p>
          <DialogFooter className="edit-process-dialog-footer">
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setSaveDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="edit-process-dialog-button edit-process-dialog-button--primary" onClick={handleSalvar} disabled={saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: encerrar */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <div className="edit-process-dialog__header">
              <div className="edit-process-dialog__icon-wrap edit-process-dialog__icon-wrap--green">
                <CheckCircle size={24} className="edit-process-dialog__icon" />
              </div>
              <DialogTitle className="edit-process-dialog-title">Encerrar processo?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            O processo será marcado como encerrado. Selecione o motivo:
          </p>
          <div className="edit-process-field">
            <Label className="edit-process-label">Motivo</Label>
            <select
              className="edit-process-select"
              value={motivoStatusProcessoId}
              onChange={(e) => setMotivoStatusProcessoId(e.target.value)}
            >
              <option value="" disabled>Selecione um motivo</option>
              {motivosEncerramento.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Justificativa (opcional)</Label>
            <Textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} className="edit-process-textarea" />
          </div>
          <DialogFooter className="edit-process-dialog-footer">
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setCloseDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="edit-process-dialog-button edit-process-dialog-button--close" onClick={handleEncerrar} disabled={saving}>
              {saving ? "Encerrando..." : "Encerrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: desativar (suspender) */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <div className="edit-process-dialog__header">
              <div className="edit-process-dialog__icon-wrap">
                <AlertTriangle size={24} className="edit-process-dialog__icon" />
              </div>
              <DialogTitle className="edit-process-dialog-title">Suspender processo?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            O processo será marcado como suspenso. Selecione o motivo:
          </p>
          <div className="edit-process-field">
            <Label className="edit-process-label">Motivo</Label>
            <select
              className="edit-process-select"
              value={motivoStatusProcessoId}
              onChange={(e) => setMotivoStatusProcessoId(e.target.value)}
            >
              <option value="" disabled>Selecione um motivo</option>
              {motivosSuspensao.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Justificativa (opcional)</Label>
            <Textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} className="edit-process-textarea" />
          </div>
          <DialogFooter className="edit-process-dialog-footer">
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setDeactivateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="edit-process-dialog-button edit-process-dialog-button--warn" onClick={handleDesativar} disabled={saving}>
              {saving ? "Suspendendo..." : "Suspender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: excluir */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <div className="edit-process-dialog__header">
              <div className="edit-process-dialog__icon-wrap edit-process-dialog__icon-wrap--red">
                <Trash2 size={24} className="edit-process-dialog__icon" />
              </div>
              <DialogTitle className="edit-process-dialog-title">Excluir processo?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            Esta ação é irreversível. Todos os dados serão removidos permanentemente.
          </p>
          <DialogFooter className="edit-process-dialog-footer">
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setDeleteDialog(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button className="edit-process-dialog-button edit-process-dialog-button--danger" onClick={handleExcluir} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
