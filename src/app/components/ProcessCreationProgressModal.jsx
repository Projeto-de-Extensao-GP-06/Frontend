import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Loader2, CheckCircle2, Clock, AlertCircle, X, ExternalLink, Minimize2 } from "lucide-react";
import "../../styles/process-creation-modal.css";

export function ProcessCreationProgressModal({
  isOpen,
  onMinimize,
  stepState = {
    criando: "pendente",
    upload: null,
    datajud: null,
    concluido: "pendente",
  },
  uploadCount = { current: 0, total: 0 },
  isFinished = false,
  onFinish = null,
  hasCnj = false,
  mode = "create",
}) {
  const isUpdate = mode === "update";

  const getPrimeiraEtapaTitulo = () => {
    if (isUpdate) {
      return "Atualizando processo no sistema";
    }
    return hasCnj ? "Registrando processo no sistema" : "Criando processo";
  };

  const steps = [
    {
      id: "criando",
      title: getPrimeiraEtapaTitulo(),
      status: stepState.criando || "pendente",
    },
  ];

  if (stepState.upload !== null && stepState.upload !== undefined) {
    steps.push({
      id: "upload",
      title: `Enviando documentos (${uploadCount.current}/${uploadCount.total})`,
      status: stepState.upload || "pendente",
    });
  }

  if (hasCnj && stepState.datajud !== null && stepState.datajud !== undefined) {
    steps.push({
      id: "datajud",
      title: "Consultando dados oficiais no DataJud",
      status: stepState.datajud || "pendente",
    });
  }

  steps.push({
    id: "concluido",
    title: "Concluído",
    status: stepState.concluido || "pendente",
  });

  const renderIcon = (status) => {
    switch (status) {
      case "em_andamento":
        return <Loader2 size={18} className="animate-spin text-blue-600" />;
      case "concluida":
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case "falha":
        return <AlertCircle size={18} className="text-amber-500" />;
      case "pendente":
      default:
        return <Clock size={18} className="text-slate-400" />;
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "em_andamento":
        return "progress-step-status is-active";
      case "concluida":
        return "progress-step-status is-done";
      case "falha":
        return "progress-step-status is-warning";
      case "pendente":
      default:
        return "progress-step-status is-pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "em_andamento":
        return "Em andamento";
      case "concluida":
        return "Concluída";
      case "falha":
        return "Falha";
      case "pendente":
      default:
        return "Pendente";
    }
  };

  const getDescricao = () => {
    if (isFinished) {
      if (hasCnj && stepState.datajud === "falha") {
        return isUpdate
          ? "Processo atualizado! Os dados do DataJud poderão ser sincronizados posteriormente."
          : "Processo criado! Os dados do DataJud poderão ser sincronizados posteriormente.";
      }
      return isUpdate
        ? "O processo foi atualizado com sucesso no sistema."
        : "O processo foi registrado com sucesso no sistema.";
    }
    if (hasCnj) {
      return "A consulta no DataJud está em andamento. Você pode aguardar a conclusão ou continuar em segundo plano:";
    }
    return isUpdate
      ? "Aguarde enquanto o processo é atualizado no sistema:"
      : "Aguarde enquanto o processo é registrado no sistema:";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (isFinished && onFinish) {
            onFinish();
          } else if (onMinimize && hasCnj) {
            onMinimize();
          }
        }
      }}
    >
      <DialogContent
        className="creation-progress-dialog"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          if (isFinished && onFinish) {
            onFinish();
          } else if (onMinimize && hasCnj) {
            onMinimize();
          }
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (isFinished && onFinish) {
            onFinish();
          } else if (onMinimize && hasCnj) {
            onMinimize();
          }
        }}
      >
        <div className="creation-progress-header">
          <div>
            <DialogTitle className="creation-progress-dialog-title">
              {isFinished
                ? (isUpdate ? "Processo Atualizado!" : "Processo Criado!")
                : (isUpdate ? "Atualizando Processo" : "Criando Processo")}
            </DialogTitle>
            <DialogDescription className="creation-progress-dialog-desc">
              {getDescricao()}
            </DialogDescription>
          </div>
          {isFinished ? (
            onFinish && (
              <button
                type="button"
                className="creation-progress-close-btn"
                onClick={onFinish}
                title="Acessar processo"
                aria-label="Acessar processo"
              >
                <X size={20} />
              </button>
            )
          ) : (
            hasCnj && onMinimize && (
              <button
                type="button"
                className="creation-progress-close-btn"
                onClick={onMinimize}
                title="Continuar em segundo plano"
                aria-label="Continuar em segundo plano"
              >
                <X size={20} />
              </button>
            )
          )}
        </div>

        <div className="creation-progress-steps-list">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`creation-progress-step-item status-${step.status}`}
            >
              <div className="creation-progress-step-icon">
                {renderIcon(step.status)}
              </div>
              <div className="creation-progress-step-info">
                <span className="creation-progress-step-title">{step.title}</span>
              </div>
              <span className={getBadgeClass(step.status)}>
                {getStatusLabel(step.status)}
              </span>
            </div>
          ))}
        </div>

        <div className="creation-progress-footer">
          {!isFinished ? (
            hasCnj && onMinimize && (
              <>
                <p className="creation-progress-hint">
                  Você pode continuar navegando na aplicação enquanto os dados são consultados em segundo plano.
                </p>
                <button
                  type="button"
                  className="creation-progress-minimize-btn"
                  onClick={onMinimize}
                >
                  <Minimize2 size={16} />
                  <span>Continuar em segundo plano</span>
                </button>
              </>
            )
          ) : (
            onFinish && (
              <button
                type="button"
                className="creation-progress-success-btn"
                onClick={onFinish}
              >
                <ExternalLink size={16} />
                <span>Acessar Processo</span>
              </button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
