import { useState, useRef, useEffect, useCallback } from "react";
import {
  Scale,
  Sparkles,
  Send,
  RefreshCw,
  Trash2,
  Search,
  FileText,
  Plus,
  BarChart3,
  CalendarRange,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { SelectProcessModal } from "../components/SelectProcessModal";
import { SelectDashboardModal, formatDateBr } from "../components/SelectDashboardModal";
import { IcsAttachmentCard } from "../components/IcsAttachmentCard";
import { ChatChartCard } from "../components/ChatChartCard";
import {
  AGENT_CHAT_SESSION_STORAGE_KEY,
  enviarMensagemAoAgente,
  limparSessaoAgente,
  removerIdsProcesso,
} from "../services/agentService";
import { buscarProcessoCompletoPorId } from "../services/processoService";
import {
  buscarDadosGeraisDashboard,
  buscarDadosFiltradosDashboard,
} from "../services/dashboardService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../../styles/ai-assistant-page.css";
import "../../styles/select-process-modal.css";

const SESSION_STORAGE_KEY = AGENT_CHAT_SESSION_STORAGE_KEY;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de inatividade

const now = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const WELCOME_MESSAGE = `Olá, eu sou a **MarIA!** A assistente virtual do **SGPJ** (Sistema Gerenciador de Processos Judiciais).

Posso te ajudar com:
- **Análise de indicadores** da dashboard do sistema;
- **Geração de arquivos ICS** para compromissos na sua agenda;
- **Análise de processos judiciais** e dúvidas do caso.

Conte comigo, estou a disposição.`;

const INITIAL_MESSAGE = {
  id: "0",
  role: "assistant",
  content: WELCOME_MESSAGE,
  time: now(),
};

function readStoredSession(currentUserId) {
  try {
    if (!currentUserId) return null;
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const nowTs = Date.now();

    // Garante que uma sessão salva por outro usuário nunca seja carregada
    if (!data.userId || data.userId !== currentUserId) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    // Se excedeu o tempo máximo de inatividade, descarta a sessão
    if (data.lastActivity && nowTs - data.lastActivity > INACTIVITY_TIMEOUT_MS) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      if (data.sessionId) {
        limparSessaoAgente(data.sessionId).catch(() => {});
      }
      return null;
    }
    return data;
  } catch (e) {
    console.error("Erro ao ler sessão do sessionStorage:", e);
    return null;
  }
}

function persistSession(sessionObj, currentUserId) {
  try {
    if (!currentUserId) return;
    const payload = {
      ...sessionObj,
      userId: currentUserId,
      lastActivity: Date.now(),
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Erro ao salvar sessão no sessionStorage:", e);
  }
}

function removeStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Erro ao remover sessão do sessionStorage:", e);
  }
}

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? user?.email ?? null;

  useEffect(() => {
    document.title = "SGPJ | MarIA";
  }, []);

  // Recupera dados salvos da sessão caso ainda estejam válidos e pertençam ao usuário atual
  const [initialData] = useState(() => readStoredSession(currentUserId));
  const hasSavedChat = Boolean(
    initialData?.messages && initialData.messages.some((m) => m.role === "user")
  );

  const [messages, setMessages] = useState(() => (hasSavedChat ? initialData.messages : []));
  const [sessionId, setSessionId] = useState(() => initialData?.sessionId || null);
  const [selectedProcess, setSelectedProcess] = useState(() => initialData?.selectedProcess || null);
  const [selectedDashboard, setSelectedDashboard] = useState(
    () => initialData?.selectedDashboard || null
  );

  const [input, setInput] = useState("");
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [typing, setTyping] = useState(() => !hasSavedChat);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fullProcessRef = useRef(null);
  const dashboardCacheRef = useRef({});
  const welcomeTimeoutRef = useRef(null);

  const MAX_TEXTAREA_LINES = 6;

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const computed = window.getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.45 || 20;
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const maxHeight = lineHeight * MAX_TEXTAREA_LINES + paddingTop + paddingBottom;

    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Exibe a animação de digitação antes da mensagem de boas-vindas ao carregar
  useEffect(() => {
    if (!hasSavedChat) {
      setTyping(true);
      welcomeTimeoutRef.current = setTimeout(() => {
        setMessages([
          {
            id: "0",
            role: "assistant",
            content: WELCOME_MESSAGE,
            time: now(),
          },
        ]);
        setTyping(false);
      }, 1200);

      return () => {
        if (welcomeTimeoutRef.current) {
          clearTimeout(welcomeTimeoutRef.current);
        }
      };
    }
  }, [hasSavedChat]);

  const triggerWelcomeWithTyping = useCallback(() => {
    setMessages([]);
    setTyping(true);
    if (welcomeTimeoutRef.current) {
      clearTimeout(welcomeTimeoutRef.current);
    }
    welcomeTimeoutRef.current = setTimeout(() => {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: WELCOME_MESSAGE,
          time: now(),
        },
      ]);
      setTyping(false);
    }, 1000);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  // Persiste a sessão no sessionStorage sempre que messages, sessionId, selectedProcess ou selectedDashboard mudarem
  useEffect(() => {
    if (currentUserId && (sessionId || messages.length > 1 || selectedProcess || selectedDashboard)) {
      persistSession(
        {
          sessionId,
          messages,
          selectedProcess,
          selectedDashboard,
        },
        currentUserId
      );
    }
  }, [currentUserId, messages, sessionId, selectedProcess, selectedDashboard]);

  // Monitora a inatividade: reseta se o tempo limite for atingido
  const handleInactivityExpiry = useCallback(() => {
    if (sessionId) {
      limparSessaoAgente(sessionId).catch(() => {});
    }
    removeStoredSession();
    setSessionId(null);
    setSelectedProcess(null);
    setSelectedDashboard(null);
    dashboardCacheRef.current = {};
    triggerWelcomeWithTyping();
    toast.info("A sessão expirou por inatividade. Uma nova conversa foi iniciada.");
  }, [sessionId, triggerWelcomeWithTyping]);

  useEffect(() => {
    const checkExpiry = () => {
      const stored = readStoredSession(currentUserId);
      // Se havia sessão ativa no estado mas o storage expirou
      if (!stored && (sessionId || messages.length > 1 || selectedProcess || selectedDashboard)) {
        handleInactivityExpiry();
      }
    };

    // Checa a cada 30 segundos
    const timer = setInterval(checkExpiry, 30 * 1000);

    // Checa quando o usuário retorna à aba
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkExpiry();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkExpiry);

    return () => {
      clearInterval(timer);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkExpiry);
    };
  }, [currentUserId, sessionId, messages.length, selectedProcess, selectedDashboard, handleInactivityExpiry]);

  // "+ Nova conversa"
  const handleNewChat = async () => {
    if (clearing || typing) return;
    setClearing(true);

    try {
      if (sessionId) {
        await limparSessaoAgente(sessionId);
      }
      removeStoredSession();
      setSessionId(null);
      setSelectedProcess(null);
      setSelectedDashboard(null);
      dashboardCacheRef.current = {};
      triggerWelcomeWithTyping();
      toast.success("Nova conversa iniciada.");
    } catch (err) {
      console.error("Erro ao iniciar nova conversa no servidor:", err);
      removeStoredSession();
      setSessionId(null);
      setSelectedProcess(null);
      setSelectedDashboard(null);
      dashboardCacheRef.current = {};
      triggerWelcomeWithTyping();
      toast.info("Nova conversa iniciada localmente.");
    } finally {
      setClearing(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: now(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);

    try {
      let dadosProcesso = null;
      if (selectedProcess) {
        const cached = fullProcessRef.current;
        if (cached && String(cached.id) === String(selectedProcess.id)) {
          dadosProcesso = cached.data;
        } else {
          // Busca o processo inteiro no mesmo endpoint da tela de detalhes e remove todos os IDs
          const processoCompleto = await buscarProcessoCompletoPorId(selectedProcess.id);
          const semIds = removerIdsProcesso(processoCompleto);
          dadosProcesso = semIds;
          fullProcessRef.current = { id: selectedProcess.id, data: semIds };
        }
      }

      let dadosDashboard = null;
      if (selectedDashboard) {
        const rangeKey = `${selectedDashboard.dateFrom}_${selectedDashboard.dateTo}`;
        let generalData = dashboardCacheRef.current.generalData;
        if (!generalData) {
          generalData = await buscarDadosGeraisDashboard();
          dashboardCacheRef.current.generalData = generalData;
        }
        let filteredData = dashboardCacheRef.current.filteredByRange?.[rangeKey];
        if (!filteredData && selectedDashboard.dateFrom && selectedDashboard.dateTo) {
          filteredData = await buscarDadosFiltradosDashboard(
            selectedDashboard.dateFrom,
            selectedDashboard.dateTo
          );
          dashboardCacheRef.current.filteredByRange = {
            ...(dashboardCacheRef.current.filteredByRange || {}),
            [rangeKey]: filteredData,
          };
        }
        dadosDashboard = removerIdsProcesso({
          periodo: {
            periodMode: selectedDashboard.periodMode,
            preset: selectedDashboard.preset,
            appliedPeriod: selectedDashboard.appliedPeriod,
            dateFrom: selectedDashboard.dateFrom,
            dateTo: selectedDashboard.dateTo,
          },
          dadosGerais: generalData,
          dadosFiltrados: filteredData,
        });
      }

      const data = await enviarMensagemAoAgente({
        message: text,
        sessionId,
        dadosProcesso,
        dadosDashboard,
      });

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Não foi possível obter uma resposta no momento.",
        attachments: data.attachments || [],
        charts: data.charts || [],
        time: now(),
      };

      setMessages((p) => [...p, assistantMsg]);
    } catch (error) {
      console.error("Erro ao comunicar com MarIA:", error);

      // Handle authentication errors from Agent Backend
      if (error?.response?.status === 401 || error?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        return;
      }

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Infelizmente não consegui me comunicar com o assistente no momento. Tente novamente em instantes.",
        time: now(),
      };
      setMessages((p) => [...p, errorMsg]);
      toast.error("Erro ao enviar mensagem para a MarIA.");
    } finally {
      setTyping(false);
    }
  };

  const procData = selectedProcess;

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-header__left">
          <p className="ai-header__kicker">Assistente de IA</p>
          <div className="ai-header__identity">
            <div className="ai-header__icon-wrap">
              <Sparkles size={18} className="ai-header__icon" />
            </div>
            <div>
              <h1 className="ai-header__title">MarIA</h1>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          disabled={clearing || typing}
          className="ai-header__new-chat-btn"
          title="Iniciar nova conversa"
        >
          <Plus size={14} className={clearing ? "animate-spin" : ""} />
          <span>Nova conversa</span>
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-msg ${msg.role === "user" ? "ai-msg--user" : "ai-msg--assistant"}`}
          >
            {msg.role === "assistant" && (
              <div className="ai-msg__avatar">
                <Scale size={14} className="ai-msg__avatar-icon" />
              </div>
            )}
            <div className="ai-msg__bubble-wrap">
              <div
                className={`ai-msg__bubble ${
                  msg.role === "user" ? "ai-msg__bubble--user" : "ai-msg__bubble--assistant"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === "assistant" && Array.isArray(msg.charts) && msg.charts.length > 0 && (
                <div className="ai-charts-attachments">
                  {msg.charts.map((chart, idx) => (
                    <ChatChartCard
                      key={`${msg.id}-chart-${idx}-${chart.title || idx}`}
                      chart={chart}
                    />
                  ))}
                </div>
              )}
              {msg.role === "assistant" && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                <div className="ai-ics-attachments">
                  {msg.attachments.map((attachment, idx) => (
                    <IcsAttachmentCard
                      key={`${msg.id}-ics-${idx}-${attachment.filename}`}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}
              <p className={`ai-msg__time ${msg.role === "user" ? "ai-msg__time--right" : ""}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="ai-msg ai-msg--assistant">
            <div className="ai-msg__avatar">
              <Scale size={14} className="ai-msg__avatar-icon" />
            </div>
            <div className="ai-typing">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="ai-typing__dot"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-picker-section">
        {procData ? (
          <div className="ai-selected-process-bar">
            <div className="ai-selected-process-info">
              <div className="ai-selected-process-icon-wrap">
                <FileText size={16} />
              </div>
              <div className="ai-selected-process-text">
                <div className="ai-selected-process-meta">
                  <span className="ai-selected-process-name" title={procData.clientName}>
                    {procData.clientName}
                  </span>
                  <span className="ai-selected-process-cnj">{procData.cnj}</span>
                  <span className="ai-selected-process-badge">{procData.phase}</span>
                  {procData.tribunal && (
                    <span className="ai-selected-process-badge ai-selected-process-badge--tribunal">
                      {procData.tribunal}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="ai-selected-process-actions">
              <button
                type="button"
                onClick={() => setIsSelectModalOpen(true)}
                className="ai-selected-process-btn"
                title="Trocar processo"
              >
                <RefreshCw size={12} />
                <span>Trocar</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProcess(null)}
                className="ai-selected-process-btn ai-selected-process-btn--remove"
                title="Remover processo (pergunta geral)"
              >
                <Trash2 size={12} />
                <span>Remover</span>
              </button>
            </div>
          </div>
        ) : selectedDashboard ? (
          <div className="ai-selected-process-bar">
            <div className="ai-selected-process-info">
              <div className="ai-selected-process-icon-wrap">
                <BarChart3 size={16} />
              </div>
              <div className="ai-selected-process-text">
                <div className="ai-selected-process-meta">
                  <span className="ai-selected-process-name" title="Dados da Dashboard">
                    Dados da Dashboard
                  </span>
                  <span className="ai-selected-process-badge">
                    {selectedDashboard.periodMode === "custom"
                      ? "Personalizado"
                      : selectedDashboard.appliedPeriod}
                  </span>
                  {selectedDashboard.dateFrom && selectedDashboard.dateTo && (
                    <span className="ai-selected-process-cnj">
                      {formatDateBr(selectedDashboard.dateFrom)} até{" "}
                      {formatDateBr(selectedDashboard.dateTo)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="ai-selected-process-actions">
              <button
                type="button"
                onClick={() => setIsDashboardModalOpen(true)}
                className="ai-selected-process-btn"
                title="Alterar período da Dashboard"
              >
                <CalendarRange size={12} />
                <span>Período</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDashboard(null)}
                className="ai-selected-process-btn ai-selected-process-btn--remove"
                title="Desvincular Dashboard"
              >
                <Trash2 size={12} />
                <span>Remover</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-picker-triggers-row">
            <button
              type="button"
              onClick={() => setIsSelectModalOpen(true)}
              className="ai-picker-trigger-compact"
            >
              <div className="ai-picker-trigger-compact-left">
                <div className="ai-picker-trigger-compact-icon-wrap">
                  <Scale size={14} />
                </div>
                <span className="ai-picker-trigger-compact-label">
                  + Vincular processo
                </span>
              </div>
              <div className="ai-picker-trigger-compact-btn">
                <Search size={13} />
                <span>Buscar</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsDashboardModalOpen(true)}
              className="ai-picker-trigger-compact"
            >
              <div className="ai-picker-trigger-compact-left">
                <div className="ai-picker-trigger-compact-icon-wrap">
                  <BarChart3 size={14} />
                </div>
                <span className="ai-picker-trigger-compact-label">
                  + Vincular dashboard
                </span>
              </div>
              <div className="ai-picker-trigger-compact-btn">
                <CalendarRange size={13} />
                <span>Período</span>
              </div>
            </button>
          </div>
        )}

        <SelectProcessModal
          open={isSelectModalOpen}
          onOpenChange={setIsSelectModalOpen}
          selectedProcessId={selectedProcess?.id}
          onSelect={(proc) => {
            setSelectedProcess(proc);
            setSelectedDashboard(null);
          }}
        />

        <SelectDashboardModal
          open={isDashboardModalOpen}
          onOpenChange={setIsDashboardModalOpen}
          currentSelection={selectedDashboard}
          onSelect={(dash) => {
            setSelectedDashboard(dash);
            setSelectedProcess(null);
          }}
        />
      </div>

      <div className="ai-input-bar">
        <div className={`ai-input-wrap ${typing ? "ai-input-wrap--disabled" : ""}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={typing ? "MarIA está digitando..." : "Digite sua mensagem..."}
            rows={1}
            disabled={typing}
            className="ai-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
        </div>
        <button
          onClick={send}
          disabled={!input.trim() || typing}
          className="ai-send-btn"
          title="Enviar mensagem"
        >
          <Send size={16} className="ai-send-btn__icon" />
        </button>
      </div>
    </div>
  );
}