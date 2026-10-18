import { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, ArrowLeft, X, AlertCircle, FileCheck, Building2, User, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { brazilStates, phases } from "../data/mockData";
import { maskCPF, maskCNPJ, maskRG, maskCEP, maskCNJ, maskCurrency, maskPhone } from "../utils/masks";
import { useCepLookup } from "../hooks/useCepLookup";
import "../../styles/accept-request-modal.css";

const steps = [
  { key: "client", label: "Dados do Cliente" },
  { key: "address", label: "Endereço" },
  { key: "process", label: "Dados do Processo" },
];

export function AcceptRequestModal({ open, onOpenChange, request, onConfirmAccept }) {
  // Mode: "confirm" (Modal 1) or "wizard" (Modal 2)
  const [mode, setMode] = useState("confirm");
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 - Client info
  const [clientType, setClientType] = useState("PF");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [profession, setProfession] = useState("");

  // Step 2 - Address info
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const numberInputRef = useRef(null);
  const cepLookup = useCepLookup(cep, open);
  const sanitizedCep = cep.replace(/\D/g, "");
  const isCurrentCepLookup = cepLookup.requestedCep === sanitizedCep;
  const isCepLoading = cepLookup.loading && isCurrentCepLookup;
  const cepLookupError = !cepLookup.loading && isCurrentCepLookup ? cepLookup.error : "";

  // Step 3 - Process info
  const [cnj, setCnj] = useState("");
  const [priority, setPriority] = useState("média");
  const [phase, setPhase] = useState(phases[0] || "Inicial");
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [causeValue, setCauseValue] = useState("");

  // Form error notification per step
  const [errorMsg, setErrorMsg] = useState("");

  // Reset or populate fields when request or open state changes
  useEffect(() => {
    if (open && request) {
      setMode("confirm");
      setCurrentStep(0);
      setErrorMsg("");

      const isPJ = request.type === "PJ" || Boolean(request.companyName);
      setClientType(isPJ ? "PJ" : "PF");
      
      // Populate from request
      setName(request.name || "");
      setCompanyName(request.companyName || (isPJ ? request.name : ""));
      setContactName(isPJ ? (request.name || "") : "");
      setEmail(request.email || "");
      setPhone(request.phone ? maskPhone(request.phone) : "");
      setCpf(request.cpf ? maskCPF(request.cpf) : "");
      setRg(request.rg ? maskRG(request.rg) : "");
      setCnpj(request.cnpj ? maskCNPJ(request.cnpj) : "");
      setProfession(request.contactRole || request.profession || "");

      setCep("");
      setStreet("");
      setNumber("");
      setComplement("");
      setNeighborhood("");
      setCity("");
      setState(request.state || "SP");

      setCnj(request.processNumber ? maskCNJ(request.processNumber) : "");
      setPriority("média");
      setPhase(phases[0] || "Inicial");
      setHearingDate("");
      setHearingTime("");
      setCauseValue("");
    }
  }, [open, request]);

  useEffect(() => {
    if (!open || !cepLookup.data || !isCurrentCepLookup) return;

    setStreet(cepLookup.data.logradouro);
    setNeighborhood(cepLookup.data.bairro);
    setCity(cepLookup.data.localidade);
    setState(cepLookup.data.uf || "SP");
    numberInputRef.current?.focus();
  }, [open, cepLookup.data, isCurrentCepLookup]);

  const handleStartWizard = () => {
    setMode("wizard");
    setCurrentStep(0);
    setErrorMsg("");
  };

  const handleClose = () => {
    setErrorMsg("");
    onOpenChange(false);
  };

  const validateStep = () => {
    setErrorMsg("");
    if (currentStep === 0) {
      if (clientType === "PF") {
        if (!name.trim()) {
          setErrorMsg("O nome completo do cliente é obrigatório.");
          return false;
        }
        if (!cpf.trim() || cpf.replace(/\D/g, "").length !== 11) {
          setErrorMsg("Por favor, preencha um CPF válido (11 dígitos).");
          return false;
        }
        if (!profession.trim()) {
          setErrorMsg("A profissão ou cargo é obrigatória.");
          return false;
        }
      } else {
        if (!companyName.trim()) {
          setErrorMsg("A razão social / nome da empresa é obrigatória.");
          return false;
        }
        if (!cnpj.trim() || cnpj.replace(/\D/g, "").length !== 14) {
          setErrorMsg("Por favor, preencha um CNPJ válido (14 dígitos).");
          return false;
        }
        if (!contactName.trim()) {
          setErrorMsg("O nome do contato principal é obrigatório.");
          return false;
        }
        if (!profession.trim()) {
          setErrorMsg("O cargo ou função do contato principal é obrigatório.");
          return false;
        }
      }
    } else if (currentStep === 1) {
      if (!cep.trim() || cep.replace(/\D/g, "").length !== 8) {
        setErrorMsg("Por favor, preencha um CEP válido com 8 dígitos.");
        return false;
      }
      if (!street.trim()) {
        setErrorMsg("O logradouro é obrigatório.");
        return false;
      }
      if (!number.trim()) {
        setErrorMsg("O número do endereço é obrigatório.");
        return false;
      }
      if (!neighborhood.trim()) {
        setErrorMsg("O bairro é obrigatório.");
        return false;
      }
      if (!city.trim()) {
        setErrorMsg("A cidade é obrigatória.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!priority || !priority.trim()) {
        setErrorMsg("A prioridade do processo é obrigatória.");
        return false;
      }
      if (!phase || !phase.trim()) {
        setErrorMsg("A fase do processo é obrigatória.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    if (validateStep()) {
      const completedData = {
        client: {
          type: clientType,
          name: clientType === "PJ" ? companyName : name,
          companyName: clientType === "PJ" ? companyName : undefined,
          email,
          phone,
          cpf: clientType === "PF" ? cpf : undefined,
          rg: clientType === "PF" ? rg : undefined,
          cnpj: clientType === "PJ" ? cnpj : undefined,
          profession: clientType === "PF" ? profession : undefined,
          address: {
            cep,
            logradouro: street,
            numero: number,
            complemento: complement,
            bairro: neighborhood,
            cidade: city,
            estado: state,
          },
          contacts: clientType === "PJ" ? [
            {
              id: `ct_${Date.now()}`,
              name: contactName,
              email: email,
              phone: phone,
              profession: profession,
              isPrimary: true,
            }
          ] : [],
        },
        process: {
          cnj: cnj || request?.processNumber || "",
          priority,
          phase,
          hearingDate,
          hearingTime,
          value: causeValue,
        },
      };

      onConfirmAccept(completedData);
      handleClose();
    }
  };

  if (!open || !request) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {mode === "confirm" ? (
        /* ──── Modal 1: Confirmação Prévia ──── */
        <DialogContent className="accept-confirm-dialog">
          <div className="accept-confirm-body">
            <div className="accept-confirm-icon-wrap">
              <FileCheck size={28} />
            </div>

            <div>
              <h2 className="accept-confirm-title">Aceitar Solicitação?</h2>
              <p className="accept-confirm-desc" style={{ marginTop: "0.5rem" }}>
                Para prosseguir com o aceite de <strong>{request.name}</strong>, é necessário
                preencher alguns dados complementares cadastrais e do processo.
              </p>
            </div>

            <div className="accept-confirm-footer">
              <button
                type="button"
                className="accept-btn accept-btn--outline"
                style={{ flex: 1 }}
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="accept-btn accept-btn--primary"
                style={{ flex: 1.2 }}
                onClick={handleStartWizard}
              >
                Prosseguir com o aceite
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </DialogContent>
      ) : (
        /* ──── Modal 2: Formulário Faseado (Wizard) ──── */
        <DialogContent className="accept-wizard-dialog">
          <div className="accept-wizard-header">
            <div className="accept-wizard-title-row">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h2 className="accept-wizard-title">Aceite de Solicitação</h2>
                  <span
                    className="accept-type-tag"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      background: clientType === "PJ" ? "#f5edd8" : "#eef1f8",
                      color: clientType === "PJ" ? "#8b6234" : "#1d4ed8",
                    }}
                  >
                    {clientType === "PJ" ? "Pessoa Jurídica (PJ)" : "Pessoa Física (PF)"}
                  </span>
                </div>
                <p className="accept-wizard-subtitle">
                  Preencha os dados complementares para prosseguir com o caso
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="accept-wizard-stepper">
              {steps.map((s, idx) => (
                <div key={s.key} className="accept-step-item">
                  <div className="accept-step-node">
                    <div
                      className={`accept-step-circle ${
                        idx < currentStep
                          ? "accept-step-circle--done"
                          : idx === currentStep
                          ? "accept-step-circle--active"
                          : "accept-step-circle--pending"
                      }`}
                    >
                      {idx < currentStep ? <Check size={13} /> : idx + 1}
                    </div>
                    <span
                      className={`accept-step-label ${
                        idx === currentStep
                          ? "accept-step-label--active"
                          : idx < currentStep
                          ? "accept-step-label--done"
                          : ""
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`accept-step-line ${
                        idx < currentStep ? "accept-step-line--done" : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "0.8125rem",
                marginBottom: "0.75rem",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Step Body */}
          <div className="accept-wizard-body">
            {/* ──── Step 1: Dados do Cliente ──── */}
            {currentStep === 0 && (
              <>
                {clientType === "PF" ? (
                  /* ── Form PF ── */
                  <div className="accept-form-grid">
                    <div className="accept-field">
                      <label className="accept-label">
                        Nome Completo do Cliente <span className="accept-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="accept-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maria dos Santos Ferreira"
                      />
                    </div>

                    <div className="accept-form-grid accept-form-grid--2">
                      <div className="accept-field">
                        <label className="accept-label">
                          CPF <span className="accept-required">*</span>
                        </label>
                        <input
                          type="text"
                          className="accept-input accept-input--mono"
                          value={cpf}
                          onChange={(e) => setCpf(maskCPF(e.target.value))}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>
                      <div className="accept-field">
                        <label className="accept-label">
                          RG <span className="accept-optional">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          className="accept-input accept-input--mono"
                          value={rg}
                          onChange={(e) => setRg(maskRG(e.target.value))}
                          placeholder="00.000.000-0"
                          maxLength={12}
                        />
                      </div>
                    </div>

                    <div className="accept-field">
                      <label className="accept-label">
                        Profissão / Ocupação <span className="accept-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="accept-input"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="Ex: Engenheiro Civil, Médica, Autônomo"
                      />
                    </div>

                    <div className="accept-form-grid accept-form-grid--2">
                      <div className="accept-field">
                        <label className="accept-label">E-mail</label>
                        <input
                          type="email"
                          className="accept-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="cliente@email.com"
                        />
                      </div>
                      <div className="accept-field">
                        <label className="accept-label">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          className="accept-input"
                          value={phone}
                          onChange={(e) => setPhone(maskPhone(e.target.value))}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Form PJ ── */
                  <div className="accept-form-grid">
                    <div className="accept-field">
                      <label className="accept-label">
                        Razão Social / Nome da Empresa <span className="accept-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="accept-input"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Construtech Soluções e Engenharia LTDA"
                      />
                    </div>

                    <div className="accept-field">
                      <label className="accept-label">
                        CNPJ <span className="accept-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="accept-input accept-input--mono"
                        value={cnpj}
                        onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                    </div>

                    {/* Bloco destacado: Contato Principal da PJ */}
                    <div className="accept-pj-contact-box">
                      <div className="accept-pj-contact-header">
                        <div className="accept-pj-contact-title-wrap">
                          <User size={16} style={{ color: "#0f2357" }} />
                          <h4 className="accept-pj-contact-title">Dados do Contato Principal</h4>
                        </div>
                        <span className="accept-pj-primary-badge">
                          <Check size={11} /> Contato Principal
                        </span>
                      </div>
                      <p className="accept-pj-contact-notice">
                        O contato cadastrado abaixo será o <strong>contato principal</strong> vinculado a esta pessoa jurídica.
                      </p>

                      <div className="accept-form-grid">
                        <div className="accept-form-grid accept-form-grid--2">
                          <div className="accept-field">
                            <label className="accept-label">
                              Nome do Contato Principal <span className="accept-required">*</span>
                            </label>
                            <input
                              type="text"
                              className="accept-input"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Ex: Carlos Mendes"
                            />
                          </div>

                          <div className="accept-field">
                            <label className="accept-label">
                              Cargo / Função <span className="accept-required">*</span>
                            </label>
                            <input
                              type="text"
                              className="accept-input"
                              value={profession}
                              onChange={(e) => setProfession(e.target.value)}
                              placeholder="Ex: Diretor Executivo, Sócio-Administrador"
                            />
                          </div>
                        </div>

                        <div className="accept-form-grid accept-form-grid--2">
                          <div className="accept-field">
                            <label className="accept-label">E-mail do Contato</label>
                            <input
                              type="email"
                              className="accept-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="carlos@construtech.com.br"
                            />
                          </div>
                          <div className="accept-field">
                            <label className="accept-label">Telefone / WhatsApp</label>
                            <input
                              type="text"
                              className="accept-input"
                              value={phone}
                              onChange={(e) => setPhone(maskPhone(e.target.value))}
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ──── Step 2: Endereço ──── */}
            {currentStep === 1 && (
              <div className="accept-form-grid">
                <div className="accept-form-grid accept-form-grid--2">
                  <div className="accept-field">
                    <label className="accept-label">
                      CEP <span className="accept-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="accept-input accept-input--mono"
                      value={cep}
                      onChange={(e) => setCep(maskCEP(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={isCepLoading}
                    />
                    {isCepLoading && (
                      <p className="accept-helper-text" role="status" aria-live="polite">
                        Consultando CEP…
                      </p>
                    )}
                    {cepLookupError && (
                      <p className="accept-cep-error" role="alert">
                        {cepLookupError}
                      </p>
                    )}
                  </div>
                  <div className="accept-field">
                    <label className="accept-label">
                      Estado (UF) <span className="accept-required">*</span>
                    </label>
                    <select
                      className="accept-select"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={isCepLoading}
                    >
                      {brazilStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="accept-form-grid accept-form-grid--3">
                  <div className="accept-field" style={{ gridColumn: "span 2" }}>
                    <label className="accept-label">
                      Logradouro (Rua / Av.) <span className="accept-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="accept-input"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Avenida Paulista"
                      disabled={isCepLoading}
                    />
                  </div>
                  <div className="accept-field">
                    <label className="accept-label">
                      Número <span className="accept-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="accept-input"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 1578 ou S/N"
                      ref={numberInputRef}
                    />
                  </div>
                </div>

                <div className="accept-form-grid accept-form-grid--2">
                  <div className="accept-field">
                    <label className="accept-label">
                      Bairro <span className="accept-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="accept-input"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Bela Vista"
                      disabled={isCepLoading}
                    />
                  </div>
                  <div className="accept-field">
                    <label className="accept-label">
                      Cidade <span className="accept-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="accept-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      disabled={isCepLoading}
                    />
                  </div>
                </div>

                <div className="accept-field">
                  <label className="accept-label">
                    Complemento <span className="accept-optional">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="accept-input"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Ex: Bloco B, Apto 42, Sala 301"
                  />
                </div>
              </div>
            )}

            {/* ──── Step 3: Dados do Processo ──── */}
            {currentStep === 2 && (
              <div className="accept-form-grid">
                <div className="accept-field">
                  <label className="accept-label">
                    Número CNJ do Processo
                    <span className="accept-optional">
                      {request.processNumber ? "(identificado na solicitação)" : "(se houver)"}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="accept-input accept-input--mono"
                    value={cnj}
                    onChange={(e) => setCnj(maskCNJ(e.target.value))}
                    placeholder="0000000-00.0000.0.00.0000"
                    maxLength={25}
                  />
                </div>

                <div className="accept-form-grid accept-form-grid--2">
                  <div className="accept-field">
                    <label className="accept-label">
                      Prioridade do Processo <span className="accept-required">*</span>
                    </label>
                    <select
                      className="accept-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="alta">Alta</option>
                      <option value="média">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>

                  <div className="accept-field">
                    <label className="accept-label">
                      Fase do Processo <span className="accept-required">*</span>
                    </label>
                    <select
                      className="accept-select"
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                    >
                      {phases.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="accept-form-grid accept-form-grid--2">
                  <div className="accept-field">
                    <label className="accept-label">
                      Data da Audiência <span className="accept-optional">(se houver)</span>
                    </label>
                    <input
                      type="date"
                      className="accept-input"
                      value={hearingDate}
                      onChange={(e) => setHearingDate(e.target.value)}
                    />
                  </div>

                  <div className="accept-field">
                    <label className="accept-label">
                      Hora da Audiência <span className="accept-optional">(se houver)</span>
                    </label>
                    <input
                      type="time"
                      className="accept-input"
                      value={hearingTime}
                      onChange={(e) => setHearingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="accept-field">
                  <label className="accept-label">
                    Valor da Causa <span className="accept-optional">(se houver)</span>
                  </label>
                  <input
                    type="text"
                    className="accept-input accept-input--mono"
                    value={causeValue}
                    onChange={(e) => setCauseValue(maskCurrency(e.target.value))}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Controls */}
          <div className="accept-wizard-footer">
            {currentStep === 0 ? (
              <button
                type="button"
                className="accept-btn accept-btn--ghost"
                onClick={handleClose}
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                className="accept-btn accept-btn--outline"
                onClick={handleBack}
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="accept-btn accept-btn--primary"
                onClick={handleNext}
              >
                Avançar
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="accept-btn accept-btn--success"
                onClick={handleFinish}
              >
                <Check size={15} />
                Concluir e Aceitar
              </button>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
