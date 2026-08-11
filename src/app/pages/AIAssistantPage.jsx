import { useState, useRef, useEffect } from "react";
import { Scale, Sparkles, Send, FileText, ChevronDown, ChevronRight, Bot } from "lucide-react";
import { mockProcesses } from "../data/mockData";
import "../../styles/ai-assistant-page.css";
const SUGGESTIONS = ["Quais são os prazos mais urgentes?", "Resumo dos processos em Citação", "Ações importantes para hoje", "Processos com audiência esta semana"];
const now = () => new Date().toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit"
});
export default function AIAssistantPage() {
  const [messages, setMessages] = useState([{
    id: "0",
    role: "assistant",
    content: "Olá! Sou o **Assistente Jurídico do SGPJ**. Selecione um processo e me faça uma pergunta — analisarei os dados e trarei as ações mais importantes.",
    time: now()
  }]);
  const [input, setInput] = useState("");
  const [selectedProcess, setProc] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, typing]);
  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: now()
    };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const proc = selectedProcess ? mockProcesses.find(p => p.id === selectedProcess) : null;
      const reply = proc ? `Com base no processo **${proc.cnj}** (${proc.clientName}):\n\n• Verificar prazo para audiência em **${proc.hearingDate}**\n• Conferir documentos pendentes de envio\n• Notificar o cliente sobre andamento da fase ${proc.phase}\n• Preparar contestação para a próxima etapa\n• Confirmar disponibilidade de testemunhas` : "Por favor, selecione um processo acima para que eu possa trazer análises específicas e personalizadas.";
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        time: now()
      };
      setTyping(false);
      setMessages(p => [...p, assistantMsg]);
    }, 1600);
  };
  const procData = selectedProcess ? mockProcesses.find(p => p.id === selectedProcess) : null;
  return <div className="ai-page">

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

      <div className="ai-picker">
        <button onClick={() => setPickerOpen(p => !p)} className={`ai-picker__trigger ${procData ? "ai-picker__trigger--active" : ""}`}>
          <div className={`ai-picker__file-icon-wrap ${procData ? "ai-picker__file-icon-wrap--active" : ""}`}>
            <FileText size={14} className={procData ? "ai-picker__file-icon--active" : "ai-picker__file-icon"} />
          </div>
          <span className="ai-picker__label">
            {procData ? `${procData.clientName}  ·  ${procData.phase}` : "+ Selecionar processo"}
          </span>
          <ChevronDown size={14} className={`ai-picker__chevron ${pickerOpen ? "ai-picker__chevron--open" : ""}`} />
        </button>
        {pickerOpen && <div className="ai-picker__dropdown">
            <button onClick={() => { setProc(null); setPickerOpen(false); }} className="ai-picker__option ai-picker__option--clear">
              Sem processo — pergunta geral
            </button>
            {mockProcesses.map(p => <button key={p.id} onClick={() => { setProc(p.id); setPickerOpen(false); }} className={`ai-picker__option ${selectedProcess === p.id ? "ai-picker__option--selected" : ""}`}>
                <p className="ai-picker__option-cnj">{p.cnj}</p>
                <p className="ai-picker__option-name">{p.clientName}</p>
              </button>)}
          </div>}
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
    </div>;
}