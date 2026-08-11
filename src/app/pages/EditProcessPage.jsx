import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, X, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { mockProcesses, mockClients, phases, tribunals } from "../data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/edit-process-page.css";
export default function EditProcessPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const process = mockProcesses.find(p => p.id === id);
  if (!process) {
    return <div className="edit-process-page edit-process-page--empty">
        <p className="edit-process-empty-text">Processo não encontrado.</p>
        <Button onClick={() => navigate("/app/inicio")} className="edit-process-empty-button">
          Voltar
        </Button>
      </div>;
  }
  const [observations, setObservations] = useState(process.observations.map(o => o.text));
  const addObs = () => setObservations(prev => [...prev, ""]);
  const updateObs = (i, val) => setObservations(prev => prev.map((o, idx) => idx === i ? val : o));
  const removeObs = i => setObservations(prev => prev.filter((_, idx) => idx !== i));
  return <div className="edit-process-page">
      {/* Breadcrumb */}
      <button onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-breadcrumb">
        <ArrowLeft size={14} />
        Processo {process.cnj.slice(0, 10)}...
      </button>

      <div className="edit-process-header">
        <p className="edit-process-kicker">Início › Processo › Edição</p>
        <h1 className="edit-process-title">
          Editar Processo
        </h1>
        <p className="edit-process-subtitle">Edite os dados desejados do processo:</p>
      </div>

      <div className="edit-process-form">
        {/* CNJ */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Número CNJ (opcional)</Label>
          <Input defaultValue={process.cnj} className="edit-process-input edit-process-input--mono" />
        </div>

        {/* Client */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Cliente</Label>
          <select className="edit-process-select" defaultValue={process.clientId}>
            {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Priority + Phase */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Prioridade</Label>
            <select className="edit-process-select" defaultValue={process.priority}>
              <option value="alta">Alta</option>
              <option value="média">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Fase</Label>
            <select className="edit-process-select" defaultValue={process.phase}>
              {phases.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Tribunal */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Sigla Tribunal</Label>
          <select className="edit-process-select" defaultValue={process.tribunal}>
            {tribunals.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Value + Date */}
        <div className="edit-process-grid edit-process-grid--2">
          <div className="edit-process-field">
            <Label className="edit-process-label">Valor da causa</Label>
            <Input defaultValue={process.value.toString()} className="edit-process-input edit-process-input--mono" />
          </div>
          <div className="edit-process-field">
            <Label className="edit-process-label">Data audiência</Label>
            <Input defaultValue={process.hearingDate !== "—" ? process.hearingDate : ""} placeholder="00/00/0000" className="edit-process-input edit-process-input--mono" />
          </div>
        </div>

        {/* Description */}
        <div className="edit-process-field">
          <Label className="edit-process-label">Descrição</Label>
          <Textarea defaultValue={process.description} className="edit-process-textarea" />
        </div>

        {/* Observations */}
        <div className="edit-process-field">
          <Label className="edit-process-label edit-process-label--spaced">Observações</Label>
          <div className="edit-process-observation-list">
            {observations.map((obs, i) => <div key={i} className="edit-process-observation-row">
                <Input value={obs} onChange={e => updateObs(i, e.target.value)} className="edit-process-input edit-process-input--with-action" />
                <button onClick={() => removeObs(i)} className="edit-process-remove-observation">
                  <X size={14} />
                </button>
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
          <div className="edit-process-doc-grid">
            {process.documents.map(doc => <div key={doc.id} className="edit-process-doc-card">
                <button className="edit-process-remove-doc">
                  <X size={13} />
                </button>
                <div className={`edit-process-doc-badge ${doc.type === "PDF" ? "edit-process-doc-badge--pdf" : "edit-process-doc-badge--generic"}`}>
                  {doc.type}
                </div>
                <p className="edit-process-doc-name">{doc.name}</p>
              </div>)}

            <div className="edit-process-doc-upload">
              <Plus size={18} className="edit-process-doc-upload-icon" />
              <p className="edit-process-doc-upload-text">Add Arquivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="edit-process-actions">
        <div className="edit-process-actions-row">
          <Button variant="outline" onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-button edit-process-button--outline">
            Cancelar
          </Button>
          <Button onClick={() => navigate(`/app/processos/${id}`)} className="edit-process-button edit-process-button--primary">
            <Save size={15} />
            Salvar Alterações
          </Button>
        </div>

        <div className="edit-process-actions-row">
          <Button className="edit-process-button edit-process-button--warn" onClick={() => navigate(`/app/processos/${id}`)}>
            Desativar Processo
          </Button>
          <Button onClick={() => setDeleteDialog(true)} className="edit-process-button edit-process-button--danger">
            <Trash2 size={14} />
            Excluir Processo
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="edit-process-dialog">
          <DialogHeader>
            <DialogTitle className="edit-process-dialog-title">Excluir processo?</DialogTitle>
          </DialogHeader>
          <p className="edit-process-dialog-text">
            Esta ação é irreversível. Todos os dados serão removidos permanentemente.
          </p>
          <DialogFooter className="edit-process-dialog-footer">
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button className="edit-process-dialog-button edit-process-dialog-button--danger" onClick={() => {
            setDeleteDialog(false);
            navigate("/app/inicio");
          }}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}