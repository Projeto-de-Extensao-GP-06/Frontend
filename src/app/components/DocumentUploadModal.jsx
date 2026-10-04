import { useRef, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import "../../styles/document-upload-modal.css";

/**
 * Modal de upload de documentos: 1) escolhe o tipo  2) escolhe 1..N arquivos  3) confirma.
 *
 * Props:
 *  - open / onOpenChange
 *  - tiposDocumento: [{ id, nome }]
 *  - onConfirm(items): items = [{ file, tipoId }]  (pode ser async)
 *  - note: texto opcional exibido acima dos botões (ex.: aviso do OneDrive)
 */
export function DocumentUploadModal({
  open,
  onOpenChange,
  tiposDocumento = [],
  onConfirm,
  note,
}) {
  const inputRef = useRef(null);
  const [tipoId, setTipoId] = useState(""); // tipo "padrão" do lote
  const [items, setItems] = useState([]);   // { key, file, tipoId: null | string }
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTipoId("");
    setItems([]);
    setError("");
    setSaving(false);
  };

  const handleOpenChange = (next) => {
    if (saving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  // tipo efetivo: o do arquivo (se o usuário sobrescreveu) ou o padrão do lote
  const effectiveTipo = (item) => item.tipoId ?? tipoId;
  const nomeDoTipo = (id) =>
    tiposDocumento.find((t) => String(t.id) === String(id))?.nome ?? "";

  const handlePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (picked.length === 0) return;

    const next = [...items];
    for (const file of picked) {
      next.push({
        key: `${file.name}_${file.size}_${file.lastModified}_${Math.random().toString(36).slice(2, 8)}`,
        file,
        tipoId: null,
      });
    }

    setItems(next);
    setError("");
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const setItemTipo = (key, value) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, tipoId: value || null } : i))
    );

  const allHaveTipo = items.length > 0 && items.every((i) => effectiveTipo(i));

  const handleConfirm = async () => {
    if (!allHaveTipo || saving) return;
    setSaving(true);
    try {
      await onConfirm(
        items.map((i) => ({ file: i.file, tipoId: effectiveTipo(i) }))
      );
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || "Não foi possível adicionar os arquivos. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="proc-dialog doc-upload">
        <DialogHeader>
          <div className="proc-dialog__header">
            <div className="proc-dialog__icon-wrap">
              <FileText size={24} className="proc-dialog__icon" />
            </div>
            <DialogTitle className="proc-dialog__title">
              Adicionar documentos
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="doc-upload__step">
          <label htmlFor="doc-upload-tipo" className="doc-upload__label">
            1. Tipo do documento
          </label>
          <select
            id="doc-upload-tipo"
            className="doc-upload__select"
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            disabled={saving}
          >
            <option value="">Selecione o tipo</option>
            {tiposDocumento.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          {tiposDocumento.length === 0 && (
            <p className="doc-upload__hint">Nenhum tipo de documento disponível no momento.</p>
          )}
        </div>

        <div className="doc-upload__step">
          <span className="doc-upload__label">2. Arquivos</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={handlePick}
          />
          <button
            type="button"
            className="doc-upload__pick"
            onClick={() => inputRef.current?.click()}
            disabled={!tipoId || saving}
          >
            <Plus size={16} />
            {items.length === 0 ? "Escolher arquivos" : "Adicionar mais arquivos"}
          </button>
          {!tipoId && (
            <p className="doc-upload__hint">Escolha o tipo antes de selecionar os arquivos.</p>
          )}

          {items.length > 0 && (
            <ul className="doc-upload__list">
              {items.map((item) => (
                <li key={item.key} className="doc-upload__item">
                  <div className="doc-upload__item-info">
                    <p className="doc-upload__item-name" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <select
                      aria-label={`Tipo de ${item.file.name}`}
                      className="doc-upload__item-select"
                      value={effectiveTipo(item)}
                      onChange={(e) => setItemTipo(item.key, e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposDocumento.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="doc-upload__item-remove"
                    onClick={() => removeItem(item.key)}
                    disabled={saving}
                    title="Remover arquivo"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {note && <p className="doc-upload__note">{note}</p>}
        {error && <p className="doc-upload__error" role="alert">{error}</p>}

        <DialogFooter className="proc-dialog__footer">
          <button
            type="button"
            className="proc-dialog__btn proc-dialog__btn--outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="proc-dialog__btn proc-dialog__btn--primary"
            onClick={handleConfirm}
            disabled={!allHaveTipo || saving}
          >
            {saving
              ? "Adicionando..."
              : items.length > 1
                ? `Adicionar ${items.length} arquivos`
                : "Adicionar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}