import { useState, useRef, useEffect } from "react";
import { Scale, Sparkles, Send, RefreshCw, Trash2, Search, Bot, FileText } from "lucide-react";
import { mockProcesses } from "../data/mockData";
import { ProcessCard } from "../components/ProcessCard";
import { SelectProcessModal } from "../components/SelectProcessModal";
import "../../styles/ai-assistant-page.css";
import "../../styles/select-process-modal.css";

const SUGGESTIONS = [
  "Quais são os prazos mais urgentes?",
  "Resumo dos processos em Citação",
  "Ações importantes para hoje",
  "Processos com audiência esta semana",
];

const now = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AIAssistantPage() {
  useEffect(() => {
    document.title = "Assistente de IA";
  }, []);

  const [messages, setMessages] = useState([
    {
      id: "0",
      role: "assistant",
      content:
        "Olá! Sou o **Assistente Jurídico do SGPJ**. Selecione um processo e me faça uma pergunta — analisarei os dados e trarei as ações mais importantes.",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedProcess, setProc] = useState(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: now(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const proc = selectedProcess
        ? mockProcesses.find((p) => p.id === selectedProcess)
        : null;
      const reply = proc
        ? `Com base no processo **${proc.cnj}** (${proc.clientName}):\n\n• Verificar prazo para audiência em **${proc.hearingDate}**\n• Conferir documentos pendentes de envio\n• Notificar o cliente sobre andamento da fase ${proc.phase}\n• Preparar contestação para a próxima etapa\n• Confirmar disponibilidade de testemunhas`
        : "Por favor, selecione um processo acima para que eu possa trazer análises específicas e personalizadas.";
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        time: now(),
      };
      setTyping(false);
      setMessages((p) => [...p, assistantMsg]);
    }, 1600);
  };

  const procData = selectedProcess
    ? mockProcesses.find((p) => p.id === selectedProcess)
    : null;

  return (
    <div className="ai-page">
      <div className="ai-header">
        <p className="ai-header__kicker">Assistente de IA</p>
        <div className="ai-header__identity">
          <div className="ai-header__icon-wrap">
            <Sparkles size={18} className="ai-header__icon" />
          </div>
          <div>
            <h1 className="ai-header__title">Assistente Jurídico</h1>
            <p className="ai-header__subtitle">Análise inteligente de processos</p>
          </div>
        </div>
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
                onClick={() => setProc(null)}
                className="ai-selected-process-btn ai-selected-process-btn--remove"
                title="Remover processo (pergunta geral)"
              >
                <Trash2 size={12} />
                <span>Remover</span>
              </button>
            </div>
          </div>
        ) : (
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
                + Vincular processo para análise personalizada
              </span>
            </div>
            <div className="ai-picker-trigger-compact-btn">
              <Search size={13} />
              <span>Buscar</span>
            </div>
          </button>
        )}

        <SelectProcessModal
          open={isSelectModalOpen}
          onOpenChange={setIsSelectModalOpen}
          selectedProcessId={selectedProcess}
          onSelect={(proc) => setProc(proc.id)}
        />
      </div>

      <div className="ai-messages">
        {messages.map(msg => <div key={msg.id} className={`ai-msg ${msg.role === "user" ? "ai-msg--user" : "ai-msg--assistant"}`}>
            {msg.role === "assistant" && <div className="ai-msg__avatar">
                <Scale size={14} className="ai-msg__avatar-icon" />
              </div>}
            <div className="ai-msg__bubble-wrap">
              <div className={`ai-msg__bubble ${msg.role === "user" ? "ai-msg__bubble--user" : "ai-msg__bubble--assistant"}`}>{msg.content}</div>
              <p className={`ai-msg__time ${msg.role === "user" ? "ai-msg__time--right" : ""}`}>{msg.time}</p>
            </div>
          </div>)}
        {typing && <div className="ai-msg ai-msg--assistant">
            <div className="ai-msg__avatar">
              <Scale size={14} className="ai-msg__avatar-icon" />
            </div>
            <div className="ai-typing">
              {[0, 1, 2].map(i => <div key={i} className="ai-typing__dot" style={{ animationDelay: `${i * 160}ms` }} />)}
            </div>
          </div>}
        {messages.length <= 1 && !typing && <div className="ai-suggestions">
            <p className="ai-suggestions__label">Sugestões de perguntas</p>
            <div className="ai-suggestions__grid">
              {SUGGESTIONS.map((s, i) => <button key={i} onClick={() => setInput(s)} className="ai-suggestion-btn">{s}</button>)}
            </div>
          </div>}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-bar">
        <div className="ai-input-wrap">
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Me diga as ações mais importantes sobre esse processo" rows={1} className="ai-input" onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }} />
        </div>
        <button onClick={send} disabled={!input.trim() || typing} className="ai-send-btn">
          <Send size={16} className="ai-send-btn__icon" />
        </button>
      </div>
    </div>
  );
}