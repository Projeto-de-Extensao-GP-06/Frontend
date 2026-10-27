import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, X, Search, Users, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ClientCard } from "../components/ClientCard";
import { SelectClientModal } from "../components/SelectClientModal";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { ProcessCreationProgressModal } from "../components/ProcessCreationProgressModal";
import {
  criarProcesso,
  listarPrioridades,
  listarFases,
  listarTribunais,
  listarTiposDocumento,
  enviarDocumentosDoCliente,
  obterCaminhoDoCliente,
  juntarObservacoes,
  MAX_OBSERVACOES,
  MAX_CARACTERES_OBSERVACAO,
} from "../services/processoService";
import { maskCNJ, maskCurrency } from "../utils/masks";
import { getDocBadgeClass } from "../utils/document";
import { toast } from "sonner";
import "../../styles/edit-process-page.css";
import "../../styles/select-client-modal.css";
import "../../styles/process-creation-modal.css";

export default function NewProcessPage() {
  const navigate = useNavigate();
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prioridades, setPrioridades] = useState([]);
  const [fases, setFases] = useState([]);
  const [tribunais, setTribunais] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [cnj, setCnj] = useState("");
  const [prioridadeId, setPrioridadeId] = useState("");
  const [faseProcessoId, setFaseProcessoId] = useState("");
  const [siglaTribunalId, setSiglaTribunalId] = useState("");
  const [causeValue, setCauseValue] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState([""]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [files, setFiles] = useState([]);

  // Modal de progresso
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);
  const [isFinished, setIsFinished] = useState(false);
  const [createdProcessId, setCreatedProcessId] = useState(null);
  const [stepState, setStepState] = useState({
    criando: "pendente",
    upload: null,
    concluido: "pendente",
  });
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });

  const handleMinimize = () => {
    isMinimizedRef.current = true;
    setIsMinimized(true);
    setCreationModalOpen(false);
    toast.info("A criação do processo continua em segundo plano. Você será notificado assim que for concluída.", {
      duration: 4000,
    });
    navigate("/app/inicio");
  };

  // Validação de campos
  const [errors, setErrors] = useState({});

  // Refs para foco no primeiro campo inválido
  const cnjRef = useRef(null);
  const clientBtnRef = useRef(null);
  const prioridadeRef = useRef(null);
  const faseRef = useRef(null);
  const tribunalRef = useRef(null);
  const causeValueRef = useRef(null);
  const hearingDateRef = useRef(null);
  const hearingTimeRef = useRef(null);
  const descriptionRef = useRef(null);
  const observationRef = useRef(null);

  useEffect(() => {
    document.title = "SGPJ | Novo Processo";
    let active = true;
    Promise.all([listarPrioridades(), listarFases(), listarTribunais()])
      .then(([priorityOptions, phases, courts]) => {
        if (!active) return;
        setPrioridades(priorityOptions);
        setFases(phases);
        setTribunais(courts);
      })
      .catch((error) => {
        console.error("Erro ao carregar opções para novo processo:", error);
        if (active) toast.error("Não foi possível carregar as opções do formulário.");
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    listarTiposDocumento()
      .then((types) => { if (active) setTiposDocumento(types); })
      .catch((error) => {
        console.error("Erro ao carregar tipos de documento:", error);
        if (active) toast.warning("Tipos de documento indisponíveis. Você poderá anexar arquivos depois da criação.");
      });

    return () => { active = false; };
  }, []);

  const addObs = () => {
    if (observations.length >= MAX_OBSERVACOES) {
      toast.warning(`Limite de ${MAX_OBSERVACOES} observações por processo atingido.`);
      return;
    }
    setObservations((prev) => [...prev, ""]);
  };

  const updateObs = (index, value) => {
    setObservations((prev) => prev.map((item, i) => (i === index ? value : item)));
    if (errors.observacoes) {
      setErrors((prev) => ({ ...prev, observacoes: undefined }));
    }
  };

  const removeObs = (index) => {
    setObservations((prev) => prev.filter((_, i) => i !== index));
    if (errors.observacoes) {
      setErrors((prev) => ({ ...prev, observacoes: undefined }));
    }
  };

  const handleStageDocuments = (items) => {
    setFiles((prev) => [
      ...prev,
      ...items.map(({ file, tipoId }) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        tipoId: String(tipoId),
      })),
    ]);
  };

  // Validação detalhada de campos
  const validate = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    // 1. Cliente obrigatório
    if (!selectedClient) {
      newErrors.cliente = "Selecione o cliente do processo.";
    }

    // 2. Prioridade obrigatória
    if (!prioridadeId) {
      newErrors.prioridade = "Selecione a prioridade do processo.";
    }

    // 3. Fase obrigatória
    if (!faseProcessoId) {
      newErrors.fase = "Selecione a fase do processo.";
    }

    // 4. Tribunal obrigatório
    if (!siglaTribunalId) {
      newErrors.tribunal = "Selecione o tribunal responsável.";
    }

    // 5. Descrição do caso (obrigatória, mín 10)
    if (!description.trim()) {
      newErrors.descricao = "A descrição do caso é obrigatória.";
    } else if (description.trim().length < 10) {
      newErrors.descricao = "A descrição deve ter no mínimo 10 caracteres.";
    } else if (description.trim().length > 5000) {
      newErrors.descricao = "A descrição não pode ter mais de 5.000 caracteres.";
    }

    // 6. CNJ: vazio ou exatamente 20 dígitos
    if (cnj) {
      const cnjLimpo = cnj.replace(/\D/g, "");
      if (cnjLimpo.length !== 20) {
        newErrors.cnj = "O CNJ deve conter exatamente 20 dígitos numéricos (ou deixe em branco).";
      }
    }

    // 7. Data e hora da audiência: data real (rejeitar 31/02, ano com 4 dígitos, ano entre 2000 e o ano atual + 10); data e hora não podem ser registradas separadamente
    if (hearingTime && !hearingDate) {
      newErrors.dataAudiencia = "Informe a data da audiência para o horário preenchido.";
    } else if (hearingDate) {
      const parts = hearingDate.split("-");
      if (parts.length !== 3 || parts[0].length !== 4) {
        newErrors.dataAudiencia = "Ano da audiência deve ter 4 dígitos no formato AAAA-MM-DD.";
      } else {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (isNaN(year) || year < 2000 || year > currentYear + 10) {
          newErrors.dataAudiencia = `O ano da audiência deve estar entre 2000 e ${currentYear + 10}.`;
        } else if (isNaN(month) || month < 1 || month > 12) {
          newErrors.dataAudiencia = "Mês da audiência inválido.";
        } else if (isNaN(day) || day < 1 || day > 31) {
          newErrors.dataAudiencia = "Dia da audiência inválido.";
        } else {
          const dateObj = new Date(year, month - 1, day);
          if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
          ) {
            newErrors.dataAudiencia = "Data da audiência inexistente no calendário (ex: 31/02).";
          } else if (!hearingTime) {
            newErrors.dataAudiencia = "Informe o horário da audiência para a data preenchida.";
          }
        }
      }
    }

    // 8. Valor da causa: maior que zero quando informado
    if (causeValue) {
      const numVal = Number(causeValue.replace(/\D/g, "")) / 100;
      if (isNaN(numVal) || numVal <= 0) {
        newErrors.valorCausa = "O valor da causa deve ser maior que zero quando informado.";
      } else if (numVal > 999999999999.99) {
        newErrors.valorCausa = "O valor da causa não pode exceder R$ 999.999.999.999,99.";
      }
    }

    // 9. Observações: limites existentes
    if (observations.length > MAX_OBSERVACOES) {
      newErrors.observacoes = `O processo aceita até ${MAX_OBSERVACOES} observações.`;
    } else if (observations.some((item) => item.trim().length > MAX_CARACTERES_OBSERVACAO)) {
      newErrors.observacoes = `Cada observação pode ter no máximo ${MAX_CARACTERES_OBSERVACAO} caracteres.`;
    } else {
      const observationText = juntarObservacoes(observations);
      if (observationText && observationText.length < 10) {
        newErrors.observacoes = "A observação deve ter pelo menos 10 caracteres.";
      } else if (observationText && observationText.length > 5000) {
        newErrors.observacoes = "O conjunto das observações pode ter no máximo 5.000 caracteres.";
      }
    }

    return newErrors;
  };

  const handleCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Foco no primeiro campo inválido
      const fieldOrder = [
        { key: "cnj", ref: cnjRef },
        { key: "cliente", ref: clientBtnRef },
        { key: "prioridade", ref: prioridadeRef },
        { key: "fase", ref: faseRef },
        { key: "tribunal", ref: tribunalRef },
        { key: "valorCausa", ref: causeValueRef },
        { key: "dataAudiencia", ref: hearingDate && !hearingTime ? hearingTimeRef : hearingDateRef },
        { key: "descricao", ref: descriptionRef },
        { key: "observacoes", ref: observationRef },
      ];

      for (const item of fieldOrder) {
        if (validationErrors[item.key] && item.ref?.current) {
          item.ref.current.focus?.();
          item.ref.current.scrollIntoView?.({ behavior: "smooth", block: "center" });
          break;
        }
      }
      return;
    }

    // Modal de progresso com etapas reais
    setStepState({
      criando: "em_andamento",
      upload: files.length > 0 ? "pendente" : null,
      concluido: "pendente",
    });
    setUploadCount({ current: 0, total: files.length });
    setIsFinished(false);
    setIsMinimized(false);
    isMinimizedRef.current = false;
    setCreatedProcessId(null);
    setCreationModalOpen(true);
    setSubmitting(true);

    const payload = {
      clienteId: Number(selectedClient.id),
      descricaoCaso: description.trim(),
      observacao: juntarObservacoes(observations) || null,
      prioridadeId: Number(prioridadeId),
      faseProcessoId: Number(faseProcessoId),
      siglaTribunalId: Number(siglaTribunalId),
      numeroProcesso: cnj ? cnj.replace(/\D/g, "") : null,
      dataAudiencia: hearingDate && hearingTime
        ? `${hearingDate}T${hearingTime}:00`
        : null,
      valorCausa: causeValue ? Number(causeValue.replace(/\D/g, "")) / 100 : null,
    };

    try {
      // 1. Criando processo e consultando o DataJud no back
      const created = await criarProcesso(payload);
      setCreatedProcessId(created.id);
      setStepState((prev) => ({ ...prev, criando: "concluida" }));

      // 2. Se houver arquivos: Enviando documentos
      if (files.length > 0) {
        setStepState((prev) => ({ ...prev, upload: "em_andamento" }));

        let caminhoDeArmazenamentoId = null;
        try {
          caminhoDeArmazenamentoId = await obterCaminhoDoCliente(Number(selectedClient.id));
        } catch (storageErr) {
          console.error("Falha ao localizar pasta do cliente:", storageErr);
        }

        if (caminhoDeArmazenamentoId) {
          const arquivosPorTipo = files.reduce((grupos, item) => {
            grupos.set(item.tipoId, [...(grupos.get(item.tipoId) || []), item.file]);
            return grupos;
          }, new Map());

          let totalEnviados = 0;
          let totalFalhas = 0;

          for (const [tipoId, arquivos] of arquivosPorTipo.entries()) {
            for (const arquivo of arquivos) {
              try {
                await enviarDocumentosDoCliente({
                  arquivos: [arquivo],
                  tipoDocumentoId: Number(tipoId),
                  clienteId: Number(selectedClient.id),
                  processoAppId: Number(created.id),
                  caminhoDeArmazenamentoId,
                });
                totalEnviados++;
              } catch (tipoError) {
                console.error(`Falha no upload de ${arquivo.name}:`, tipoError);
                totalFalhas++;
              }
              setUploadCount({ current: totalEnviados + totalFalhas, total: files.length });
            }
          }

          if (totalFalhas === 0) {
            setStepState((prev) => ({ ...prev, upload: "concluida" }));
            toast.success(
              files.length === 1
                ? "Documento anexado com sucesso."
                : `${files.length} documentos anexados com sucesso.`
            );
          } else if (totalEnviados > 0) {
            setStepState((prev) => ({ ...prev, upload: "concluida" }));
            toast.warning(
              `${totalEnviados} de ${files.length} documentos foram enviados. Falha no envio de ${totalFalhas} documento(s).`
            );
          } else {
            setStepState((prev) => ({ ...prev, upload: "falha" }));
            toast.warning(
              "O processo foi criado, mas houve erro no envio dos anexos. Você pode reenviá-los na tela do processo."
            );
          }
        } else {
          setStepState((prev) => ({ ...prev, upload: "falha" }));
          toast.warning(
            "Não foi possível acessar a pasta do OneDrive. Os documentos poderão ser anexados depois."
          );
        }
      }

      // 3. Concluído
      setStepState((prev) => ({ ...prev, concluido: "concluida" }));
      setIsFinished(true);

      const foiMinimizado = isMinimizedRef.current;

      if (foiMinimizado) {
        // Se o usuário colocou em segundo plano, NUNCA redirecionamos forçado para não atrapalhar o que ele estiver fazendo!
        setIsMinimized(false);
        setCreationModalOpen(false);

        if (created?.sincronizado === false && payload.numeroProcesso) {
          toast.info("Processo criado com sucesso!", {
            description: "Não foi possível carregar os dados do DataJud no momento. Você poderá tentar sincronizar mais tarde diretamente na página do processo.",
            action: {
              label: "Ver Processo",
              onClick: () => navigate(`/app/processos/${created.id}`),
            },
            duration: 15000,
          });
        } else {
          toast.success("Processo criado e sincronizado com o DataJud!", {
            action: {
              label: "Ver Processo",
              onClick: () => navigate(`/app/processos/${created.id}`),
            },
            duration: 12000,
          });
        }
      } else {
        // Se o usuário optou por aguardar no modal aberto
        if (created?.sincronizado === false && payload.numeroProcesso) {
          toast.info(
            "Processo criado com sucesso! Não foi possível estabelecer conexão com o DataJud no momento. Você poderá tentar sincronizar mais tarde diretamente na página do processo.",
            { duration: 8000 }
          );
        } else {
          toast.success("Processo criado e dados sincronizados com sucesso!");
        }

        setTimeout(() => {
          setCreationModalOpen(false);
          navigate(`/app/processos/${created.id}`);
        }, 1200);
      }

    } catch (error) {
      console.error("Erro ao criar processo:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Não foi possível criar o processo. Verifique os dados e tente novamente.";

      setCreationModalOpen(false);
      setIsMinimized(false);
      isMinimizedRef.current = false;

      if (error.response?.status === 409 || message.toLowerCase().includes("cnj")) {
        setErrors((prev) => ({ ...prev, cnj: message }));
        cnjRef.current?.focus?.();
        cnjRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        toast.error(message, { duration: 7000 });
      } else {
        toast.error(message, { duration: 8000 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-process-page">
      <button
        type="button"
        onClick={() => navigate("/app/inicio")}
        className="edit-process-breadcrumb"
      >
        <ArrowLeft size={14} />
        Início
      </button>

      <div className="edit-process-header">
        <p className="edit-process-kicker">Início › Novo Processo</p>
        <h1 className="edit-process-title">Novo Processo</h1>
        <p className="edit-process-subtitle">Preencha os dados para cadastrar o processo:</p>
      </div>

      <div className="edit-process-form">
        {/* CNJ */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Número CNJ (opcional)</Label>
          <Input
            ref={cnjRef}
            type="text"
            value={cnj}
            onChange={(event) => {
              setCnj(maskCNJ(event.target.value));
              if (errors.cnj) setErrors((prev) => ({ ...prev, cnj: undefined }));
            }}
            placeholder="0000000-00.0000.0.00.0000"
            maxLength={25}
            className="edit-process-input edit-process-input--mono"
          />
          {errors.cnj && (
            <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.cnj}
            </p>
          )}
        </div>

        {/* Cliente */}
        <div className="edit-process-field">
          <div className="new-process-client-header">
            <Label className="edit-process-label" style={{ marginBottom: 0 }}>Cliente</Label>
            {selectedClient && (
              <div className="selected-client-header-actions">
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(true)}
                  className="selected-client-action-btn"
                >
                  <RefreshCw size={13} /> Trocar cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setErrors((prev) => ({ ...prev, cliente: "Selecione o cliente do processo." }));
                  }}
                  className="selected-client-action-btn selected-client-action-btn--remove"
                  title="Remover cliente"
                >
                  <Trash2 size={13} /> Remover
                </button>
              </div>
            )}
          </div>
          {selectedClient ? (
            <div className="selected-client-card-container">
              <ClientCard client={selectedClient} showChevron={false} />
            </div>
          ) : (
            <button
              ref={clientBtnRef}
              type="button"
              onClick={() => setIsSelectModalOpen(true)}
              className="client-picker-trigger"
            >
              <div className="client-picker-trigger-content">
                <div className="client-picker-trigger-icon-wrap"><Users size={18} /></div>
                <div>
                  <p className="client-picker-trigger-title">Selecionar Cliente</p>
                  <p className="client-picker-trigger-sub">Busque entre os clientes cadastrados</p>
                </div>
              </div>
              <div className="client-picker-trigger-btn"><Search size={14} /> Buscar</div>
            </button>
          )}
          {errors.cliente && (
            <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.cliente}
            </p>
          )}
          <SelectClientModal
            open={isSelectModalOpen}
            onOpenChange={setIsSelectModalOpen}
            selectedClientId={selectedClient?.id}
            onSelect={(client) => {
              setSelectedClient(client);
              if (errors.cliente) setErrors((prev) => ({ ...prev, cliente: undefined }));
            }}
          />
        </div>

        {/* Prioridade e Fase */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Prioridade</Label>
            <select
              ref={prioridadeRef}
              className="edit-process-select"
              value={prioridadeId}
              onChange={(event) => {
                setPrioridadeId(event.target.value);
                if (errors.prioridade) setErrors((prev) => ({ ...prev, prioridade: undefined }));
              }}
              disabled={loadingOptions}
            >
              <option value="">Selecione</option>
              {prioridades.map((item) => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </select>
            {errors.prioridade && (
              <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
                {errors.prioridade}
              </p>
            )}
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Fase</Label>
            <select
              ref={faseRef}
              className="edit-process-select"
              value={faseProcessoId}
              onChange={(event) => {
                setFaseProcessoId(event.target.value);
                if (errors.fase) setErrors((prev) => ({ ...prev, fase: undefined }));
              }}
              disabled={loadingOptions}
            >
              <option value="">Selecione</option>
              {fases.map((item) => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </select>
            {errors.fase && (
              <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
                {errors.fase}
              </p>
            )}
          </div>
        </div>

        {/* Sigla Tribunal */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Sigla Tribunal</Label>
          <select
            ref={tribunalRef}
            className="edit-process-select"
            value={siglaTribunalId}
            onChange={(event) => {
              setSiglaTribunalId(event.target.value);
              if (errors.tribunal) setErrors((prev) => ({ ...prev, tribunal: undefined }));
            }}
            disabled={loadingOptions}
          >
            <option value="">Selecionar tribunal...</option>
            {tribunais.map((item) => (
              <option key={item.id} value={item.id}>{item.siglaTribunal}</option>
            ))}
          </select>
          {errors.tribunal && (
            <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.tribunal}
            </p>
          )}
        </div>

        {/* Valor da causa e Audiência */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Valor da causa (opcional)</Label>
            <Input
              ref={causeValueRef}
              type="text"
              value={causeValue}
              onChange={(event) => {
                setCauseValue(maskCurrency(event.target.value));
                if (errors.valorCausa) setErrors((prev) => ({ ...prev, valorCausa: undefined }));
              }}
              placeholder="R$ 0,00"
              maxLength={26}
              className="edit-process-input edit-process-input--mono"
            />
            {errors.valorCausa && (
              <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
                {errors.valorCausa}
              </p>
            )}
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Data e hora da audiência (opcional)</Label>
            <div className="edit-process-datetime-group">
              <Input
                ref={hearingDateRef}
                type="date"
                value={hearingDate}
                min="2000-01-01"
                max={`${new Date().getFullYear() + 10}-12-31`}
                onChange={(event) => {
                  setHearingDate(event.target.value);
                  if (errors.dataAudiencia) setErrors((prev) => ({ ...prev, dataAudiencia: undefined }));
                }}
                className="edit-process-input edit-process-input--mono"
              />
              <Input
                ref={hearingTimeRef}
                type="time"
                value={hearingTime}
                onChange={(event) => {
                  setHearingTime(event.target.value);
                  if (errors.dataAudiencia) setErrors((prev) => ({ ...prev, dataAudiencia: undefined }));
                }}
                className="edit-process-input edit-process-input--mono"
              />
            </div>
            {errors.dataAudiencia && (
              <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
                {errors.dataAudiencia}
              </p>
            )}
          </div>
        </div>

        {/* Descrição do caso */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Descrição do caso</Label>
          <Textarea
            ref={descriptionRef}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.descricao) setErrors((prev) => ({ ...prev, descricao: undefined }));
            }}
            placeholder="Descreva o contexto do processo (mínimo de 10 caracteres)..."
            maxLength={5000}
            className="edit-process-textarea"
          />
          <span className="new-process-field-hint">
            {description.trim().length}/5000 caracteres · mínimo 10
          </span>
          {errors.descricao && (
            <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.descricao}
            </p>
          )}
        </div>

        {/* Observações */}
        <div className="edit-process-field">
          <div className="new-process-observation-header">
            <Label className="edit-process-label edit-process-label--spaced">
              Observações ({observations.length}/{MAX_OBSERVACOES})
            </Label>
            <span className="new-process-field-hint">
              Até {MAX_CARACTERES_OBSERVACAO} caracteres por observação
            </span>
          </div>
          <div className="edit-process-observation-list">
            {observations.map((observation, index) => (
              <div key={index} className="edit-process-observation-row new-process-observation-row">
                <div className="new-process-observation-input-row">
                  <Input
                    ref={index === 0 ? observationRef : undefined}
                    value={observation}
                    onChange={(event) => updateObs(index, event.target.value)}
                    placeholder={`Digite a observação ${index + 1}...`}
                    maxLength={MAX_CARACTERES_OBSERVACAO}
                    className="edit-process-input edit-process-input--with-action"
                  />
                  <button
                    type="button"
                    onClick={() => removeObs(index)}
                    className="edit-process-remove-observation"
                    title="Remover observação"
                    aria-label={`Remover observação ${index + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="new-process-observation-counter">
                  <span className={observation.length >= MAX_CARACTERES_OBSERVACAO ? "is-at-limit" : ""}>
                    {observation.length}/{MAX_CARACTERES_OBSERVACAO} caracteres
                  </span>
                </div>
              </div>
            ))}
          </div>
          {errors.observacoes && (
            <p className="edit-process-field-error" style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.observacoes}
            </p>
          )}
          <button
            type="button"
            onClick={addObs}
            className="edit-process-add-observation"
            disabled={observations.length >= MAX_OBSERVACOES}
          >
            <Plus size={14} /> Adicionar observação
          </button>
        </div>

        {/* Documentos */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Documentos (opcional)</Label>
          <p className="edit-process-doc-hint">
            Adicione os arquivos e classifique cada um. Eles serão enviados ao OneDrive quando o processo for criado.
          </p>
          {files.length > 0 && (
            <div className="new-process-file-list">
              {files.map(({ key, file, tipoId }) => (
                <div key={key} className="new-process-file-item">
                  <div className={`edit-process-doc-badge ${getDocBadgeClass(file.name.split(".").pop())}`}>
                    {file.name.split(".").pop().slice(0, 4).toUpperCase()}
                  </div>
                  <div className="new-process-file-item__info">
                    <span title={file.name}>{file.name}</span>
                    <small>
                      {tiposDocumento.find((tipo) => String(tipo.id) === String(tipoId))?.nome || "Documento"}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((item) => item.key !== key))}
                    aria-label={`Remover ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="edit-process-doc-upload"
            onClick={() => setUploadModalOpen(true)}
            disabled={!tiposDocumento.length}
          >
            <Plus size={18} className="edit-process-doc-upload-icon" />
            <p className="edit-process-doc-upload-text">
              {files.length ? "Adicionar mais arquivos" : "Adicionar arquivos"}
            </p>
          </button>
          {!tiposDocumento.length && (
            <span className="new-process-field-hint">Tipos de documento indisponíveis no momento.</span>
          )}
        </div>
      </div>

      <div className="edit-process-actions">
        <div className="edit-process-actions-row">
          <Button
            variant="outline"
            onClick={() => navigate("/app/inicio")}
            className="edit-process-button edit-process-button--outline"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            className="edit-process-button edit-process-button--primary"
            disabled={submitting || loadingOptions}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Criando processo...
              </>
            ) : (
              <>
                <Plus size={16} /> Criar Processo
              </>
            )}
          </Button>
        </div>
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        tiposDocumento={tiposDocumento}
        onConfirm={handleStageDocuments}
        note="Os arquivos ficam preparados aqui e serão enviados ao cliente após a criação do processo. Você pode definir um tipo padrão para o lote e ajustar o tipo de cada arquivo."
      />

      <ProcessCreationProgressModal
        isOpen={creationModalOpen}
        onMinimize={handleMinimize}
        stepState={stepState}
        uploadCount={uploadCount}
        isFinished={isFinished}
        onFinish={() => {
          setCreationModalOpen(false);
          if (createdProcessId) {
            navigate(`/app/processos/${createdProcessId}`);
          }
        }}
      />

      {isMinimized && submitting && (
        <div
          className="creation-floating-indicator"
          onClick={() => {
            setIsMinimized(false);
            setCreationModalOpen(true);
          }}
          title="Clique para ver o progresso detalhado"
        >
          <div className="creation-floating-icon">
            <Loader2 size={18} className="animate-spin text-blue-400" />
          </div>
          <div className="creation-floating-text">
            <span className="creation-floating-title">Criando processo em segundo plano</span>
            <span className="creation-floating-subtitle">
              {stepState.upload === "em_andamento"
                ? `Enviando documentos (${uploadCount.current}/${uploadCount.total})...`
                : "Consultando o DataJud..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}