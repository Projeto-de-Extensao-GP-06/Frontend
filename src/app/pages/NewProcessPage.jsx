import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, FileText, Trash2, X, Search, Users, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ClientCard } from "../components/ClientCard";
import { SelectClientModal } from "../components/SelectClientModal";
import { phases, tribunals } from "../data/mockData";
import "../../styles/edit-process-page.css";
import "../../styles/select-client-modal.css";

const maskDate = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const maskCNJ = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 20);
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
  if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
  if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16)}`;
};

const maskCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    const safeNumber = Math.min(value, 9999999999999.99);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(safeNumber);
  }
  // DECIMAL(15,2): máx. 15 dígitos no total (13 inteiros + 2 decimais)
  const digits = value.toString().replace(/\D/g, "").slice(0, 15);
  if (!digits) return "";
  const numberValue = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};

export default function NewProcessPage() {
  useEffect(() => {
    document.title = "Novo Processo";
  }, []);

  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [cnj, setCnj] = useState("");
  const [causeValue, setCauseValue] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [observations, setObservations] = useState([""]);

  const addObs = () => setObservations((prev) => [...prev, ""]);
  const updateObs = (i, val) =>
    setObservations((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  const removeObs = (i) =>
    setObservations((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="edit-process-page">
      {/* Breadcrumb */}
      <button onClick={() => navigate("/app/inicio")} className="edit-process-breadcrumb">
        <ArrowLeft size={14} />
        Início
      </button>

      <div className="edit-process-header">
        <p className="edit-process-kicker">Início › Novo Processo</p>
        <h1 className="edit-process-title">Novo Processo</h1>
        <p className="edit-process-subtitle">Preencha os dados do processo:</p>
      </div>

      <div className="edit-process-form">
        {/* CNJ */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Número CNJ (opcional)</Label>
          <Input
            type="text"
            value={cnj}
            onChange={(e) => setCnj(maskCNJ(e.target.value))}
            placeholder="0000000-00.0000.0.00.0000"
            maxLength={25}
            className="edit-process-input edit-process-input--mono"
          />
        </div>

        {/* Client Selection via Modal */}
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
              Cliente
            </Label>
            {selectedClient && (
              <div className="selected-client-header-actions">
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(true)}
                  className="selected-client-action-btn"
                >
                  <RefreshCw size={13} />
                  Trocar cliente
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="selected-client-action-btn selected-client-action-btn--remove"
                  title="Remover cliente"
                >
                  <Trash2 size={13} />
                  Remover
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
              type="button"
              onClick={() => setIsSelectModalOpen(true)}
              className="client-picker-trigger"
            >
              <div className="client-picker-trigger-content">
                <div className="client-picker-trigger-icon-wrap">
                  <Users size={18} />
                </div>
                <div>
                  <p className="client-picker-trigger-title">Selecionar Cliente</p>
                  <p className="client-picker-trigger-sub">
                    Clique para buscar e selecionar um cliente
                  </p>
                </div>
              </div>
              <div className="client-picker-trigger-btn">
                <Search size={14} />
                Buscar
              </div>
            </button>
          )}

          <SelectClientModal
            open={isSelectModalOpen}
            onOpenChange={setIsSelectModalOpen}
            selectedClientId={selectedClient?.id}
            onSelect={setSelectedClient}
          />
        </div>

        {/* Priority + Phase */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Prioridade</Label>
            <select className="edit-process-select">
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Fase</Label>
            <select className="edit-process-select">
              {phases.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tribunal */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Sigla Tribunal</Label>
          <select className="edit-process-select">
            <option value="">Selecionar tribunal...</option>
            {tribunals.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Value + Date */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Valor da causa (opcional)</Label>
            <Input
              type="text"
              value={causeValue}
              onChange={(e) => setCauseValue(maskCurrency(e.target.value))}
              placeholder="R$ 0,00"
              maxLength={26}
              className="edit-process-input edit-process-input--mono"
            />
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Data e hora da audiência (opcional)</Label>
            <div className="edit-process-datetime-group">
              <Input
                type="text"
                value={hearingDate}
                onChange={(e) => setHearingDate(maskDate(e.target.value))}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                className="edit-process-input edit-process-input--mono"
              />
              <Input
                type="time"
                className="edit-process-input edit-process-input--mono"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Descrição (opcional)</Label>
          <Textarea
            placeholder="Descreva o contexto do processo..."
            className="edit-process-textarea"
          />
        </div>

        {/* Observations */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Observações</Label>
          <div className="edit-process-observation-list">
            {observations.map((obs, i) => (
              <div key={i} className="edit-process-observation-row">
                <Input
                  value={obs}
                  onChange={(e) => updateObs(i, e.target.value)}
                  placeholder={`• Observação ${i + 1}`}
                  className="edit-process-input edit-process-input--with-action"
                />
                {observations.length > 1 && (
                  <button
                    onClick={() => removeObs(i)}
                    className="edit-process-remove-observation"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addObs} className="edit-process-add-observation">
            <Plus size={14} />
            Adicionar observação
          </button>
        </div>

        {/* Documents */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Documentos</Label>
          <div className="edit-process-doc-upload" style={{ minHeight: "7rem" }}>
            <div className="edit-process-doc-upload-icon-wrap">
              <FileText size={18} className="edit-process-doc-upload-icon" />
            </div>
            <p className="edit-process-doc-name">Carregar arquivo</p>
            <p className="edit-process-doc-upload-text">Solte ou clique para selecionar</p>
            <Button
              type="button"
              variant="outline"
              className="edit-process-button edit-process-button--outline"
              style={{ height: "2.25rem", marginTop: "0.25rem" }}
            >
              <Plus size={14} />
              Adicionar Arquivo
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="edit-process-actions">
        <div className="edit-process-actions-row">
          <Button
            variant="outline"
            onClick={() => navigate("/app/inicio")}
            className="edit-process-button edit-process-button--outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => navigate("/app/inicio")}
            className="edit-process-button edit-process-button--primary"
          >
            <Plus size={16} />
            Adicionar Processo
          </Button>
        </div>
      </div>
    </div>
  );
}