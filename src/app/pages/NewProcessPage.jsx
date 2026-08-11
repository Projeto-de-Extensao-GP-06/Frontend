import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, FileText, Trash2, X, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { mockClients, phases, tribunals } from "../data/mockData";
import "../../styles/edit-process-page.css";
export default function NewProcessPage() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState([""]);
  const addObs = () => setObservations(prev => [...prev, ""]);
  const updateObs = (i, val) => setObservations(prev => prev.map((o, idx) => idx === i ? val : o));
  const removeObs = i => setObservations(prev => prev.filter((_, idx) => idx !== i));
  return <div className="edit-process-page">
      {/* Breadcrumb */}
      <button onClick={() => navigate("/app/inicio")} className="edit-process-breadcrumb">
        <ArrowLeft size={14} />
        Início
      </button>

      <div className="edit-process-header">
        <p className="edit-process-kicker">Início › Novo Processo</p>
        <h1 className="edit-process-title">
          Novo Processo
        </h1>
        <p className="edit-process-subtitle">Preencha os dados do processo:</p>
      </div>

      <div className="edit-process-form">
        {/* CNJ */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Número CNJ (opcional)</Label>
          <Input placeholder="0000000-00.0000.0.00.0000" className="edit-process-input edit-process-input--mono" />
        </div>

        {/* Client */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Cliente</Label>
          <select className="edit-process-select">
            <option value="">Selecionar cliente...</option>
            {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
              {phases.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Tribunal */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Sigla Tribunal</Label>
          <select className="edit-process-select">
            <option value="">Selecionar tribunal...</option>
            {tribunals.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Value + Date */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Valor da causa (opcional)</Label>
            <Input placeholder="R$ 0,00" className="edit-process-input edit-process-input--mono" />
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Data audiência (opcional)</Label>
            <Input placeholder="00/00/0000" className="edit-process-input edit-process-input--mono" />
          </div>
        </div>

        {/* Description */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Descrição (opcional)</Label>
          <Textarea placeholder="Descreva o contexto do processo..." className="edit-process-textarea" />
        </div>

        {/* Observations */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Observações</Label>
          <div className="edit-process-observation-list">
            {observations.map((obs, i) => <div key={i} className="edit-process-observation-row">
                <Input value={obs} onChange={e => updateObs(i, e.target.value)} placeholder={`• Observação ${i + 1}`} className="edit-process-input edit-process-input--with-action" />
                {observations.length > 1 && <button onClick={() => removeObs(i)} className="edit-process-remove-observation">
                    <X size={14} />
                  </button>}
              </div>)}
          </div>
          <button onClick={addObs} className="edit-process-add-observation">
            <Plus size={14} />
            Adicionar observação
          </button>
        </div>

        {/* Documents */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Documentos</Label>
          <div className="edit-process-doc-upload" style={{minHeight: '7rem'}}>
            <div className="edit-process-doc-upload-icon-wrap">
              <FileText size={18} className="edit-process-doc-upload-icon" />
            </div>
            <p className="edit-process-doc-name">Carregar arquivo</p>
            <p className="edit-process-doc-upload-text">Solte ou clique para selecionar</p>
            <Button type="button" variant="outline" className="edit-process-button edit-process-button--outline" style={{height:'2.25rem', marginTop:'0.25rem'}}>
              <Plus size={14} />
              Add Arquivo
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="edit-process-actions">
        <div className="edit-process-actions-row">
          <Button variant="outline" onClick={() => navigate("/app/inicio")} className="edit-process-button edit-process-button--outline">
            Cancelar
          </Button>
          <Button onClick={() => navigate("/app/inicio")} className="edit-process-button edit-process-button--primary">
            <Check size={16} />
            Adicionar Processo
          </Button>
        </div>
      </div>
    </div>;
}